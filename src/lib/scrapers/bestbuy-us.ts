// Best Buy US — deals page
// Strategy: parse JSON-LD product blocks + DOM patterns

import type { RawDeal } from './types'
import { fetchHTML, extractJsonLd, stripTags, parsePrice, decodeHtmlEntities, extractAll } from './utils'

export async function scrapeBestBuyUS(): Promise<RawDeal[]> {
  return scrapeBestBuyImpl('US', 'bestbuy-us', 'Best Buy', 'https://www.bestbuy.com/site/promo/top-deals')
}

export async function scrapeBestBuyImpl(
  country: 'US' | 'CA',
  slug: string,
  name: string,
  sourceUrl: string,
): Promise<RawDeal[]> {
  const html = await fetchHTML(sourceUrl)
  const out: RawDeal[] = []

  // PASS 1: JSON-LD
  const jsonld = extractJsonLd(html)
  for (const block of jsonld) {
    const products = Array.isArray(block) ? block : [block]
    for (const p of products) {
      if (p?.['@type'] !== 'Product') continue
      const offer = p.offers?.[0] || p.offers
      if (!offer) continue
      const dealPrice = parseFloat(offer.price ?? offer.lowPrice ?? '0') || null
      if (!dealPrice) continue

      out.push({
        retailer_slug: slug,
        retailer_name: name,
        country,
        source_url: sourceUrl,
        product_url: p.url || sourceUrl,
        title: String(p.name || '').slice(0, 200),
        image_url: typeof p.image === 'string' ? p.image : (p.image?.[0] || null),
        deal_price: dealPrice,
        original_price: null,
        discount_percent: null,
        deal_type: 'daily',
      })
      if (out.length >= 30) break
    }
    if (out.length >= 30) break
  }

  if (out.length > 0) return out

  // PASS 2: HTML fallback for tile cards
  const tilePattern = /<a[^>]+href="(\/site\/[^"]+\.p\?skuId=\d+)"[^>]*>([\s\S]*?)<\/a>/gi
  const tiles = extractAll(html, tilePattern)

  for (const tile of tiles) {
    const path = tile[1]
    const tileBody = tile[2]

    const titleMatch = tileBody.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/) || tileBody.match(/title="([^"]+)"/)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1])).trim()
    if (title.length < 10) continue

    const prices = extractAll(tileBody, /\$\s?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)
      .map(m => parsePrice(m[0])).filter((p): p is number => p !== null).sort((a, b) => a - b)
    if (!prices.length) continue

    const dealPrice = prices[0]
    const originalPrice = prices.length > 1 ? prices[prices.length - 1] : null

    const baseHost = country === 'CA' ? 'https://www.bestbuy.ca' : 'https://www.bestbuy.com'
    out.push({
      retailer_slug: slug,
      retailer_name: name,
      country,
      source_url: sourceUrl,
      product_url: path.startsWith('http') ? path : `${baseHost}${path}`,
      title: title.slice(0, 200),
      deal_price: dealPrice,
      original_price: originalPrice,
      discount_percent: originalPrice ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : null,
      deal_type: 'daily',
    })
    if (out.length >= 60) break
  }

  return out
}
