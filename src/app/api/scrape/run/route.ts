// /api/scrape/run
//
// Runs a scraper (or all scrapers) and writes raw deals to scraped_deals_raw
// with status='pending' for the curator to evaluate later.
//
// Usage:
//   POST /api/scrape/run                            → run all enabled scrapers
//   POST /api/scrape/run?retailer=amazon-us         → run one scraper
//
// Auth: CRON_SECRET via x-cron-secret header or ?secret= query param.
//       (No secret configured = dev mode = allowed.)

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { SCRAPERS, getScraper } from '@/lib/scrapers/registry'
import { dedupByUrl } from '@/lib/scrapers/utils'
import type { RawDeal, ScrapeResult } from '@/lib/scrapers/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
    || req.nextUrl.searchParams.get('secret') === secret
}

async function runOneScraper(slug: string, scrapeFn: () => Promise<RawDeal[]>): Promise<ScrapeResult> {
  const t0 = Date.now()
  try {
    const deals = dedupByUrl(await scrapeFn())
    return { retailer: slug, ok: true, count: deals.length, deals, duration_ms: Date.now() - t0 }
  } catch (e: any) {
    return { retailer: slug, ok: false, count: 0, deals: [], error: e?.message || String(e), duration_ms: Date.now() - t0 }
  }
}

async function persistRawDeals(deals: RawDeal[]): Promise<{ inserted: number; failed: number }> {
  if (deals.length === 0) return { inserted: 0, failed: 0 }

  const rows = deals.map(d => ({
    retailer_slug: d.retailer_slug,
    retailer_name: d.retailer_name,
    country: d.country,
    source_url: d.source_url,
    product_url: d.product_url,
    title: d.title.slice(0, 500),
    description: d.description?.slice(0, 2000) || null,
    image_url: d.image_url || null,
    category: d.category || null,
    deal_price: d.deal_price,
    original_price: d.original_price || null,
    discount_percent: d.discount_percent || null,
    coupon_code: d.coupon_code || null,
    expires_at: d.expires_at || null,
    deal_type: d.deal_type,
    raw: d.raw || null,
    status: 'pending',
  }))

  // Upsert by product_url to avoid duplicates across consecutive scrapes
  const BATCH = 200
  let inserted = 0
  let failed = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error, count } = await supabase
      .from('scraped_deals_raw')
      .upsert(batch, { onConflict: 'product_url', ignoreDuplicates: false, count: 'exact' })
    if (error) {
      failed += batch.length
    } else {
      inserted += count || batch.length
    }
  }
  return { inserted, failed }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const startedAt = Date.now()
  const retailer = req.nextUrl.searchParams.get('retailer')

  let scrapers: { slug: string; scrape: () => Promise<RawDeal[]> }[]
  if (retailer) {
    const s = getScraper(retailer)
    if (!s) return NextResponse.json({ error: `unknown retailer: ${retailer}` }, { status: 404 })
    scrapers = [s]
  } else {
    scrapers = SCRAPERS.filter(s => s.enabled).map(s => ({ slug: s.slug, scrape: s.scrape }))
  }

  // Run all in parallel — each scraper is independent
  const results = await Promise.all(scrapers.map(s => runOneScraper(s.slug, s.scrape)))

  // Aggregate all deals
  const allDeals = results.flatMap(r => r.deals)
  const persistResult = await persistRawDeals(allDeals)

  return NextResponse.json({
    ok: true,
    duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    total_scraped: allDeals.length,
    total_inserted: persistResult.inserted,
    total_failed: persistResult.failed,
    by_retailer: results.map(r => ({
      retailer: r.retailer,
      ok: r.ok,
      count: r.count,
      error: r.error,
      ms: r.duration_ms,
    })),
  })
}

export async function GET(req: NextRequest) { return POST(req) }
