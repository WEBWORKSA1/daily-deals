// Unified read layer. Every listing page asks for deals here.
// 1) Curated deals from Supabase (scrapers + curator + community) come first.
// 2) If there aren't enough, the live feed layer tops the list up.
// Result: pages are always full and always fresh, even if the DB pipeline stalls.

import type { Deal } from '@/types'
import { supabase } from '@/lib/db'
import { getLiveDeals, getLiveFeed } from '@/lib/feeds/live'

export type DealFeed = 'all' | 'hot' | 'flash' | 'clearance' | 'us' | 'canada' | 'featured' | 'editors' | 'coupons' | 'under50'

const CATEGORY_DB: Record<string, string[]> = {
  electronics: ['Electronics'],
  fashion: ['Fashion'],
  'home-kitchen': ['Home & Kitchen', 'Home'],
  'sports-outdoors': ['Sports', 'Sports & Outdoors', 'Outdoor'],
  grocery: ['Grocery'],
  beauty: ['Beauty'],
  gaming: ['Gaming'],
  tools: ['Tools'],
  automotive: ['Automotive'],
  office: ['Office'],
  toys: ['Toys'],
}

export function categoryNames(slug: string): string[] { return CATEGORY_DB[slug] || [] }

function mapDb(rows: any[]): Deal[] {
  return (rows || []).map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
    retailer_brand_color: d.retailers?.brand_color,
    affiliate_net: d.retailers?.affiliate_net,
  }))
}

export interface DealQuery {
  feed?: DealFeed
  category?: string // slug
  store?: string // retailer slug
  q?: string
  limit?: number
  excludeIds?: number[]
}

async function fromDb(o: DealQuery, limit: number): Promise<Deal[]> {
  try {
    let q: any = supabase.from('deals').select('*, retailers(name, slug, brand_color, affiliate_net)').eq('is_active', true)
    switch (o.feed) {
      case 'flash': q = q.eq('deal_type', 'flash'); break
      case 'clearance': q = q.eq('deal_type', 'clearance'); break
      case 'us': q = q.in('country', ['US', 'BOTH']); break
      case 'canada': q = q.in('country', ['CA', 'BOTH']); break
      case 'featured': q = q.eq('is_featured', true); break
      case 'editors': q = q.eq('is_editors_choice', true); break
      case 'coupons': q = q.not('coupon_code', 'is', null); break
      case 'under50': q = q.lte('deal_price', 50); break
    }
    if (o.category) {
      const names = categoryNames(o.category)
      if (names.length) q = q.in('category', names)
    }
    if (o.q) q = q.ilike('title', `%${o.q.replace(/[%_]/g, '')}%`)
    q = o.feed === 'hot' || o.feed === 'all' || !o.feed
      ? q.order('hotness_score', { ascending: false }).order('created_at', { ascending: false })
      : q.order('discount_percent', { ascending: false, nullsFirst: false })
    const { data, error } = await q.limit(limit)
    if (error) return []
    let rows = mapDb(data || [])
    if (o.store) rows = rows.filter(d => d.retailer_slug === o.store)
    return rows
  } catch { return [] }
}

function matchLive(d: Deal, o: DealQuery): boolean {
  switch (o.feed) {
    case 'flash': if (d.deal_type !== 'flash') return false; break
    case 'clearance': if (d.deal_type !== 'clearance') return false; break
    case 'us': if (d.country === 'CA') return false; break
    case 'canada': if (d.country === 'US') return false; break
    case 'featured': case 'editors': if (!d.is_editors_choice && (d.discount_percent || 0) < 30) return false; break
    case 'coupons': if (!d.coupon_code) return false; break
    case 'under50': if (d.deal_price > 50) return false; break
  }
  if (o.category) {
    const names = categoryNames(o.category)
    if (names.length && !names.includes(d.category)) return false
  }
  if (o.store) {
    const base = o.store.replace(/-(ca|us)$/, '')
    if (!(d.retailer_slug || '').startsWith(base)) return false
  }
  if (o.q) {
    const words = o.q.toLowerCase().split(/\s+/).filter(Boolean)
    const hay = `${d.title} ${d.retailer_name} ${d.category}`.toLowerCase()
    if (!words.every(w => hay.includes(w))) return false
  }
  return true
}

export async function getDeals(o: DealQuery = {}): Promise<Deal[]> {
  const limit = o.limit ?? 24
  const [db, live] = await Promise.all([fromDb(o, limit), getLiveDeals()])
  const exclude = new Set(o.excludeIds || [])
  const seen = new Set<string>()
  const out: Deal[] = []
  const push = (d: Deal) => {
    if (exclude.has(d.id)) return
    const key = d.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 48)
    if (seen.has(key)) return
    seen.add(key)
    out.push(d)
  }
  db.forEach(push)
  if (out.length < limit) {
    let pool = live.filter(d => matchLive(d, o))
    if (o.feed === 'flash' || o.feed === 'clearance') pool.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
    for (const d of pool) { if (out.length >= limit) break; push(d) }
  }
  return out.slice(0, limit)
}

export async function getSiteStats(): Promise<{ dbActive: number; live: number; sources: number; fetchedAt: string | null }> {
  let dbActive = 0
  try {
    const { count } = await supabase.from('deals').select('*', { count: 'exact', head: true }).eq('is_active', true)
    dbActive = count || 0
  } catch {}
  try {
    const f = await getLiveFeed()
    return { dbActive, live: f.deals.length, sources: f.sources.filter(s => s.count > 0).length, fetchedAt: f.fetchedAt }
  } catch { return { dbActive, live: 0, sources: 0, fetchedAt: null } }
}

export async function getRetailers(limit = 24) {
  try {
    const { data } = await supabase.from('retailers').select('*').eq('is_active', true).order('name').limit(limit)
    return data || []
  } catch { return [] }
}
