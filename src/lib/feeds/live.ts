// LIVE DEAL LAYER — the reason Daily.Deals is never empty.
//
// Pulls structured public deal feeds at request time, normalizes them into Deal
// objects, and caches the result for 30 minutes (Next.js data cache, shared across
// every page and every visitor). No database, no API keys, no cron required — every
// visit after the cache window triggers a fresh pull, so the site refreshes itself
// all day, every day. Each feed failing independently is tolerated.
//
// Attribution: every live deal credits its source and links to the original post.
// Outbound shopping links go through /go (signed, monetized server-side).

import { unstable_cache } from 'next/cache'
import { createHmac } from 'crypto'
import type { Deal } from '@/types'
import { parseFeed, extractPrices, findRetailerFor, classify, dealTypeFor, productQuery, hash32, tag, stripTags } from './parse'
import { AMAZON_US_TAG, AMAZON_CA_TAG } from '@/lib/site'

const UA = 'Mozilla/5.0 (compatible; DailyDealsBot/2.0; +https://daily.deals/about)'
const SKIMLINKS_ID = process.env.NEXT_PUBLIC_SKIMLINKS_ID || process.env.SKIMLINKS_PUBLISHER_ID || '302790X1790814'

export interface Source {
  id: string
  name: string
  url: string
  country: 'US' | 'CA' | 'BOTH'
  kind: 'rss' | 'cheapshark'
  homepage: string
}

export const SOURCES: Source[] = [
  { id: 'dealnews', name: 'dealnews', url: 'https://www.dealnews.com/?rss=1', country: 'US', kind: 'rss', homepage: 'https://www.dealnews.com' },
  { id: '9to5toys', name: '9to5Toys', url: 'https://9to5toys.com/feed/', country: 'US', kind: 'rss', homepage: 'https://9to5toys.com' },
  { id: 'slickdeals', name: 'Slickdeals', url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1', country: 'US', kind: 'rss', homepage: 'https://slickdeals.net' },
  { id: 'slickdeals-pop', name: 'Slickdeals', url: 'https://slickdeals.net/newsearch.php?mode=popdeals&searcharea=deals&searchin=first&rss=1', country: 'US', kind: 'rss', homepage: 'https://slickdeals.net' },
  { id: 'rfd', name: 'RedFlagDeals', url: 'https://forums.redflagdeals.com/feed/forum/9', country: 'CA', kind: 'rss', homepage: 'https://forums.redflagdeals.com' },
  { id: 'bapcsalescanada', name: 'r/bapcsalescanada', url: 'https://www.reddit.com/r/bapcsalescanada/.rss', country: 'CA', kind: 'rss', homepage: 'https://www.reddit.com/r/bapcsalescanada' },
  { id: 'buildapcsales', name: 'r/buildapcsales', url: 'https://www.reddit.com/r/buildapcsales/.rss', country: 'US', kind: 'rss', homepage: 'https://www.reddit.com/r/buildapcsales' },
  { id: 'cheapshark', name: 'CheapShark', url: 'https://www.cheapshark.com/api/1.0/deals?sortBy=Deal%20Rating&pageSize=30&onSale=1', country: 'BOTH', kind: 'cheapshark', homepage: 'https://www.cheapshark.com' },
]

const CHEAPSHARK_STORES: Record<string, string> = { '1': 'Steam', '2': 'GamersGate', '3': 'Green Man Gaming', '7': 'GOG', '8': 'EA App', '11': 'Humble Store', '13': 'Ubisoft Store', '15': 'Fanatical', '21': 'WinGameStore', '23': 'GameBillet', '24': 'Voidu', '25': 'Epic Games Store', '27': 'Gamesplanet', '28': 'Gamesload', '29': '2Game', '30': 'IndieGala', '31': 'Blizzard', '33': 'DLGamer', '34': 'Noctre', '35': 'DreamGame' }

// ── signed outbound links ─────────────────────────────────────────────────
function secret() { return process.env.CRON_SECRET || process.env.LINK_SIGNING_SECRET || 'daily-deals-link-v1' }
export function signUrl(u: string): string { return createHmac('sha256', secret()).update(u).digest('hex').slice(0, 20) }
export function goLink(target: string): string { return `/go?u=${encodeURIComponent(target)}&s=${signUrl(target)}` }

export function monetize(target: string, country: 'US' | 'CA' | 'BOTH'): string {
  try {
    const url = new URL(target)
    const host = url.hostname.toLowerCase()
    if (/(^|\.)amazon\.(com|ca)$/.test(host)) {
      url.searchParams.set('tag', host.endsWith('.ca') ? AMAZON_CA_TAG : AMAZON_US_TAG)
      return url.toString()
    }
    if (/cheapshark\.com$|reddit\.com$|dealnews\.com$|9to5toys\.com$|slickdeals\.net$|redflagdeals\.com$/.test(host)) return target
    return `https://go.skimresources.com/?id=${SKIMLINKS_ID}&xs=1&url=${encodeURIComponent(target)}`
  } catch { return target }
}

// ── normalization ─────────────────────────────────────────────────────────
/** Multi-product roundup posts ("Early Black Friday Apple deals: MacBook, AirPods and more")
 *  have no single price, so they're kept out of the deal grid. */
export function isRoundup(title: string): boolean {
  const t = title.replace(/[‘’]/g, "'").replace(/\s+/g, ' ')
  if (/\b(?:and|&|\+)\s*more\b|,\s*more\s*$|\bround-?up\b|\bdeals? of the (?:day|week)\b/i.test(t)) return true
  if (/\bdeals\b[^:]*\bup to \d{1,2}% off\b/i.test(t)) return true
  if (/^(?:today'?s|this week'?s|weekend|early|the best|best|top|\d+\s+best)\b[^:]*\bdeals\b/i.test(t)) return true
  if (/\b(?:black friday|cyber monday|prime day|boxing day|labou?r day|memorial day)\b[^:$]*\b(?:deals|sale)\s*(?::|—|–|-|$)/i.test(t) && !/\$\s?\d/.test(t)) return true
  return false
}

function normalizeRss(src: Source, xml: string): Deal[] {
  const out: Deal[] = []
  for (const it of parseFeed(xml).slice(0, 40)) {
    if (isRoundup(it.title)) continue
    const dnPrice = tag(it.raw, 'dealnews:price')
    const dnRetailer = tag(it.raw, 'dealnews:retailer')
    const dnExpires = tag(it.raw, 'dealnews:expires')
    const dnCategory = tag(it.raw, 'dealnews:category')
    const staffPick = tag(it.raw, 'dealnews:staffPick') === 'true'
    const { price: tPrice, original } = extractPrices(`${it.title} ${it.description.slice(0, 240)}`)
    const price = dnPrice ? parseFloat(dnPrice) : tPrice
    if (price === null || isNaN(price)) continue
    const retailer = findRetailerFor(src.country, dnRetailer, it.title, it.description.slice(0, 300), it.html.slice(0, 2000))
    const country: 'US' | 'CA' | 'BOTH' = src.country === 'CA' ? 'CA' : retailer?.country === 'CA' ? 'CA' : 'US'
    const query = productQuery(it.title)
    const target = retailer && query.length > 3 ? retailer.search(query) : it.link
    const expires = dnExpires && !isNaN(Date.parse(dnExpires)) ? new Date(dnExpires).toISOString() : null
    const text = `${it.title} ${it.description}`
    const stated = it.title.match(/(?<!up to )\b(\d{1,2})%\s*off\b/i)
    const discount = original ? Math.round(((original - price) / original) * 100) : stated ? parseInt(stated[1], 10) : null
    const id = -(hash32(src.id + it.link) % 2_000_000_000) - 1
    out.push({
      id,
      title: it.title.replace(/\s+/g, ' ').slice(0, 180),
      description: it.description ? it.description.slice(0, 280) : null,
      original_price: original,
      deal_price: price,
      discount_percent: discount && discount > 0 && discount < 96 ? discount : null,
      retailer_id: 0,
      retailer_name: retailer?.name || dnRetailer || src.name,
      retailer_slug: retailer?.slug,
      category: classify(text, dnCategory || it.categories.join(' ')),
      image_url: it.image,
      affiliate_url: target,
      coupon_code: (text.match(/\b(?:code|coupon)[:\s]+["“]?([A-Z0-9]{4,20})\b/)?.[1]) || null,
      is_online: true, is_national: true, is_featured: staffPick,
      country,
      deal_type: dealTypeFor(text, expires),
      location_region: null,
      expires_at: expires,
      click_count: 0,
      created_at: it.published && !isNaN(Date.parse(it.published)) ? new Date(it.published).toISOString() : new Date().toISOString(),
      is_editors_choice: staffPick,
      source_name: src.name,
      source_url: it.link,
      out_url: goLink(monetize(target, country)),
      is_live: true,
    })
  }
  return out
}

function normalizeCheapShark(src: Source, json: any[]): Deal[] {
  return (Array.isArray(json) ? json : []).slice(0, 30).map((g: any) => {
    const price = parseFloat(g.salePrice)
    const original = parseFloat(g.normalPrice)
    const target = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(g.dealID)}`
    const store = CHEAPSHARK_STORES[String(g.storeID)] || 'PC game store'
    return {
      id: -(hash32('cs' + g.dealID) % 2_000_000_000) - 1,
      title: `${g.title} (PC) — ${store}`,
      description: g.steamRatingText ? `Steam reviews: ${g.steamRatingText} (${g.steamRatingPercent}%). Metacritic: ${g.metacriticScore || 'n/a'}.` : null,
      original_price: original > price ? original : null,
      deal_price: price,
      discount_percent: Math.round(parseFloat(g.savings)) || null,
      retailer_id: 0,
      retailer_name: store,
      category: 'Gaming',
      image_url: g.thumb || null,
      affiliate_url: target,
      coupon_code: null,
      is_online: true, is_national: true, is_featured: false,
      country: 'BOTH' as const,
      deal_type: (parseFloat(g.savings) >= 80 ? 'flash' : 'daily') as any,
      location_region: null,
      expires_at: null,
      click_count: 0,
      created_at: g.lastChange ? new Date(g.lastChange * 1000).toISOString() : new Date().toISOString(),
      source_name: src.name,
      source_url: `https://www.cheapshark.com/`,
      out_url: goLink(target),
      is_live: true,
    } as Deal
  }).filter(d => !isNaN(d.deal_price))
}

async function pull(src: Source): Promise<Deal[]> {
  try {
    const res = await fetch(src.url, {
      headers: { 'User-Agent': UA, Accept: src.kind === 'cheapshark' ? 'application/json' : 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' },
      signal: AbortSignal.timeout(8000),
      // Must be cacheable (not no-store) so ISR pages can render it; unstable_cache governs freshness.
      next: { revalidate: 1800, tags: ['live-deals'] },
    })
    if (!res.ok) { console.warn('[live] source', src.id, 'status', res.status); return [] }
    if (src.kind === 'cheapshark') return normalizeCheapShark(src, await res.json())
    return normalizeRss(src, await res.text())
  } catch (e: any) {
    console.warn('[live] source', src.id, 'failed', e?.message)
    return []
  }
}

function score(d: Deal): number {
  const disc = d.discount_percent || 0
  const ageH = (Date.now() - new Date(d.created_at).getTime()) / 3_600_000
  return Math.min(disc, 80) * 0.6 + Math.max(0, 30 - ageH) + (d.image_url ? 8 : 0) + (d.is_editors_choice ? 10 : 0) + (d.original_price ? 6 : 0)
}

async function collect(): Promise<{ deals: Deal[]; sources: Array<{ id: string; name: string; count: number }>; fetchedAt: string }> {
  // Local development only: DD_FEED_FIXTURE=/path/to/rss.xml replays a saved feed instead of the network.
  const fixture = process.env.DD_FEED_FIXTURE
  const results = fixture
    ? [{ s: SOURCES[0], deals: normalizeRss(SOURCES[0], (await import('fs')).readFileSync(fixture, 'utf8')) }]
    : await Promise.all(SOURCES.map(async s => ({ s, deals: await pull(s) })))
  const seen = new Set<string>()
  const deals: Deal[] = []
  for (const { deals: ds } of results) {
    for (const d of ds) {
      const key = d.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 48)
      if (seen.has(key)) continue
      seen.add(key)
      deals.push({ ...d, hotness_score: Math.round(Math.min(99, score(d))) })
    }
  }
  deals.sort((a, b) => (b.hotness_score || 0) - (a.hotness_score || 0))
  return {
    deals,
    sources: results.map(r => ({ id: r.s.id, name: r.s.name, count: r.deals.length })),
    fetchedAt: new Date().toISOString(),
  }
}

export const getLiveFeed = unstable_cache(collect, ['live-deal-feed-v5'], { revalidate: 1800, tags: ['live-deals'] })

export async function getLiveDeals(): Promise<Deal[]> {
  try { return (await getLiveFeed()).deals } catch { return [] }
}

export { stripTags }
