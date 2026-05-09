// /api/admin/scraper-stats — read-only stats for the scraper dashboard.
//
// Returns: queue counts by status, breakdown per retailer, last 10 raw rows.
// Auth: must be signed in as is_admin user.

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req).catch(() => null)
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  if (!user.is_admin) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

  // Counts by status
  const statuses = ['pending', 'published', 'rejected', 'error']
  const counts: Record<string, number> = { pending: 0, published: 0, rejected: 0, errors: 0 }
  for (const s of statuses) {
    const { count } = await supabase
      .from('scraped_deals_raw')
      .select('*', { count: 'exact', head: true })
      .eq('status', s)
    if (s === 'error') counts.errors = count || 0
    else counts[s] = count || 0
  }

  // Per-retailer counts (last 7 days, all statuses combined for visibility)
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  const { data: byRetailer } = await supabase
    .from('scraped_deals_raw')
    .select('retailer_slug, status')
    .gte('scraped_at', since)
    .limit(2000)

  const retailerMap = new Map<string, { retailer_slug: string; count: number; status: string }>()
  if (byRetailer) {
    for (const row of byRetailer as any[]) {
      const key = `${row.retailer_slug}-${row.status}`
      const existing = retailerMap.get(key)
      if (existing) existing.count++
      else retailerMap.set(key, { retailer_slug: row.retailer_slug, count: 1, status: row.status })
    }
  }

  // Last 10 rows (most recent first)
  const { data: recent } = await supabase
    .from('scraped_deals_raw')
    .select('id, title, retailer_slug, status, curator_score, curator_reasoning, deal_price, original_price, scraped_at')
    .order('scraped_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    ok: true,
    pending: counts.pending,
    published: counts.published,
    rejected: counts.rejected,
    errors: counts.errors,
    by_retailer: Array.from(retailerMap.values()).sort((a, b) => b.count - a.count),
    recent: recent || [],
  })
}
