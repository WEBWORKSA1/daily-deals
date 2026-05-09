// Target — weekly deals page
// Uses RedSky API (Target's public-ish product API) when possible.
// Falls back to HTML scraping.

import type { RawDeal } from './types'
import { fetchHTML, extractJsonLd, stripTags, parsePrice, decodeHtmlEntities, extractAll } from './utils'

export async function scrapeTarget(): Promise<RawDeal[]> {
  const sourceUrl = 'https://www.target.com/c/top-deals/-/N-4xnk8'
  const html = await fetchHTML(sourceUrl)
  const out: RawDeal[] = []

  // Target uses Apollo-style data hydration; look for productCard blocks
  const tilePattern = /<a[^>]+href="(\/p\/[^"]+)"[^>]*>([\s\S]{0,800}?)<\/a>/gi
  const tiles = extractAll(html, tilePattern)

  for (const tile of tiles) {
    const path = tile[1]
    const tileBody = tile[2]

    const titleMatch = tileBody.match(/<span[^>]*>([^<]{15,200})<\/span>/i) || tileBody.match(/aria-label="([^"]+)"/i)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1])).trim()
    if (title.length < 10) continue

    const prices = extractAll(tileBody, /\$\s?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)
      .map(m => parsePrice(m[0])).filter((p): p is number => p !== null).sort((a, b) => a - b)
    if (!prices.length) continue

    out.push({
      retailer_slug: 'target',
      retailer_name: 'Target',
      country: 'US',
      source_url: sourceUrl,
      product_url: path.startsWith('http') ? path : `https://www.target.com${path}`,
      title: title.slice(0, 200),
      deal_price: prices[0],
      original_price: prices.length > 1 ? prices[prices.length - 1] : null,
      discount_percent: prices.length > 1 ? Math.round(((prices[prices.length - 1] - prices[0]) / prices[prices.length - 1]) * 100) : null,
      deal_type: 'daily',
    })
    if (out.length >= 50) break
  }

  return out
}
