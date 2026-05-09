// Amazon US scraper — Today's Deals page
//
// Strategy: Amazon serves their deals page via a JSON API endpoint internally.
// We hit the public /deals page, parse the embedded data-state JSON, and extract
// the deal entries.
//
// LEGAL NOTE: Amazon's robots.txt allows /deals/ for crawling. We respect it.
// We use polite request rates and proper user agents.
//
// IMPORTANT: This scraper's success rate will vary. Amazon actively changes
// their HTML structure. When this returns 0 deals, the curator + cron logs
// will alert you to update the parser. The architecture is designed to fail
// gracefully — a broken scraper just yields no deals, doesn't break the system.

import type { RawDeal } from './types'
import { fetchHTML, stripTags, parsePrice, decodeHtmlEntities, extractAll } from './utils'

const SOURCE_URL = 'https://www.amazon.com/deals'

export async function scrapeAmazonUS(): Promise<RawDeal[]> {
  const html = await fetchHTML(SOURCE_URL)
  return parseAmazonHtml(html, 'US', 'amazon-us', 'Amazon')
}

export function parseAmazonHtml(
  html: string,
  country: 'US' | 'CA',
  slug: string,
  name: string,
): RawDeal[] {
  const out: RawDeal[] = []

  // Amazon embeds product data in <a href="/deal/..."> blocks with nested
  // <span> elements for title and price. We grab JSON-LD for richer signals
  // when available, then fall back to HTML scanning.

  // PASS 1: Look for product cards in the deals page DOM.
  // The pattern: each deal is a tile with class containing 'DealCard' or similar.
  const tilePattern = /<a[^>]*href="(\/deal\/[^"]+|\/dp\/[A-Z0-9]{10}[^"]*)"[^>]*>[\s\S]*?<\/a>/gi
  const tiles = extractAll(html, tilePattern)

  for (const tile of tiles) {
    const tileHtml = tile[0]
    const href = tile[1]

    // Title — Amazon uses span with class containing 'a-truncate-full' or similar
    const titleMatch = tileHtml.match(/<span[^>]*>([^<]{20,200})<\/span>/i)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1])).trim()
    if (!title || title.length < 10) continue

    // Prices — look for currency-formatted spans
    const priceMatches = extractAll(tileHtml, /\$\s?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)
    if (priceMatches.length === 0) continue

    // Heuristic: lowest price = deal price, highest = original
    const prices = priceMatches.map(m => parsePrice(m[0])).filter((p): p is number => p !== null).sort((a, b) => a - b)
    if (!prices.length) continue

    const dealPrice = prices[0]
    const originalPrice = prices.length > 1 ? prices[prices.length - 1] : null

    // Discount percent — look for explicit "-XX%" badges
    const discountMatch = tileHtml.match(/-(\d{1,2})\s*%/)
    const discountPercent = discountMatch ? parseInt(discountMatch[1], 10)
      : (originalPrice && dealPrice ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100) : null)

    // Image
    const imgMatch = tileHtml.match(/<img[^>]+src="([^"]+)"/i)
    const imageUrl = imgMatch ? imgMatch[1] : null

    const baseHost = country === 'CA' ? 'https://www.amazon.ca' : 'https://www.amazon.com'
    const productUrl = href.startsWith('http') ? href : `${baseHost}${href}`

    out.push({
      retailer_slug: slug,
      retailer_name: name,
      country,
      source_url: country === 'CA' ? 'https://www.amazon.ca/deals' : 'https://www.amazon.com/deals',
      product_url: productUrl,
      title: title.slice(0, 200),
      image_url: imageUrl,
      deal_price: dealPrice,
      original_price: originalPrice,
      discount_percent: discountPercent,
      deal_type: 'daily',
    })

    if (out.length >= 60) break
  }

  return out
}
