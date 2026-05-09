// AI Deal Scout — admin endpoint to run discovery
// POST /api/scout/run with { feed_url, source_name, type }
// GET  /api/scout/queue — list pending scout-discovered deals for review
// POST /api/scout/approve — approve a pending deal
// POST /api/scout/reject — reject (delete) a pending deal

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { processCandidate, scoreScoutCandidate, detectRetailer, detectCategory, extractPrice, ScoutCandidate } from '@/lib/scout'

export const dynamic = 'force-dynamic'

// Simple RSS parser — enough for most deal feeds
function parseRSS(xml: string): Array<any> {
  const items: any[] = []
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  const matches = xml.matchAll(itemRegex)

  for (const m of matches) {
    const itemXml = m[1]
    const title = (itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
      .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim()
    const link = (itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || '').trim()
    const description = (itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || '')
      .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
      .replace(/<[^>]+>/g, '').trim()
    const enclosure = itemXml.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] || null
    const mediaContent = itemXml.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] || null
    const pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || null

    if (title && link) {
      items.push({
        title,
        link,
        description,
        image_url: enclosure || mediaContent,
        pubDate,
      })
    }
  }
  return items
}

export async function POST(request: NextRequest) {
  // Admin only
  const user = await getUserFromRequest(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { feed_url, source_name, auto_approve_above, min_score } = body

  if (!feed_url || !source_name) {
    return NextResponse.json({ error: 'feed_url and source_name required' }, { status: 400 })
  }

  // Fetch the feed
  let xml: string
  try {
    const res = await fetch(feed_url, {
      headers: { 'User-Agent': 'Daily.Deals Scout/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`Feed returned ${res.status}`)
    xml = await res.text()
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to fetch feed: ${e.message}` }, { status: 502 })
  }

  // Parse items
  const items = parseRSS(xml)
  if (items.length === 0) {
    return NextResponse.json({ error: 'No items found in feed', xml_length: xml.length }, { status: 400 })
  }

  // Process each item
  const results = []
  for (const item of items.slice(0, 50)) {
    const text = `${item.title} ${item.description || ''}`
    const retailer = detectRetailer(text)
    const category = detectCategory(text)
    const price = extractPrice(text)

    const candidate: ScoutCandidate = {
      source_url: feed_url,
      source_name,
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      price,
      original_price: null,
      retailer_slug: retailer,
      category,
      affiliate_url: item.link,
      raw: item,
    }

    const result = await processCandidate(candidate, {
      auto_approve_above: auto_approve_above ?? 80,
      min_score: min_score ?? 50,
    })

    results.push({
      title: item.title.slice(0, 60),
      score: result.score,
      saved: result.saved,
      retailer,
      category,
      reason: result.reason,
    })
  }

  return NextResponse.json({
    ok: true,
    items_found: items.length,
    items_processed: results.length,
    items_saved: results.filter(r => r.saved).length,
    results,
  })
}

// Preview a feed without saving
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const feedUrl = url.searchParams.get('feed_url')
  if (!feedUrl) return NextResponse.json({ error: 'feed_url query param required' }, { status: 400 })

  try {
    const res = await fetch(feedUrl, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`Feed returned ${res.status}`)
    const xml = await res.text()
    const items = parseRSS(xml).slice(0, 20)

    const enriched = items.map(item => {
      const text = `${item.title} ${item.description || ''}`
      const retailer = detectRetailer(text)
      const category = detectCategory(text)
      const price = extractPrice(text)
      const candidate: ScoutCandidate = {
        source_url: feedUrl,
        source_name: 'preview',
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        price,
        original_price: null,
        retailer_slug: retailer,
        category,
        affiliate_url: item.link,
        raw: item,
      }
      return {
        title: item.title,
        retailer,
        category,
        price,
        score: scoreScoutCandidate(candidate),
        link: item.link,
        image_url: item.image_url,
      }
    })

    return NextResponse.json({ ok: true, count: items.length, items: enriched })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
