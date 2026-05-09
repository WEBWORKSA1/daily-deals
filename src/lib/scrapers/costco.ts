// Costco online-only deals
import type { RawDeal } from './types'
import { fetchHTML, stripTags, parsePrice, decodeHtmlEntities, extractAll } from './utils'

export async function scrapeCostco(): Promise<RawDeal[]> {
  const sourceUrl = 'https://www.costco.com/online-only.html'
  const html = await fetchHTML(sourceUrl)
  const out: RawDeal[] = []

  // Costco product tiles: <div class="product-tile"> wrapping <a> with title + price
  const tilePattern = /<a[^>]+href="(https?:\/\/www\.costco\.com\/[^"]+\.product\.\d+\.html)"[^>]*>([\s\S]{0,800}?)<\/a>/gi
  const tiles = extractAll(html, tilePattern)

  for (const tile of tiles) {
    const productUrl = tile[1]
    const tileBody = tile[2]

    const titleMatch = tileBody.match(/automation-id="productDescriptionLink"[^>]*>([^<]+)/) || tileBody.match(/<span[^>]*>([^<]{15,200})<\/span>/)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1])).trim()
    if (title.length < 10) continue

    const prices = extractAll(tileBody, /\$\s?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)
      .map(m => parsePrice(m[0])).filter((p): p is number => p !== null).sort((a, b) => a - b)
    if (!prices.length) continue

    out.push({
      retailer_slug: 'costco',
      retailer_name: 'Costco',
      country: 'US',
      source_url: sourceUrl,
      product_url: productUrl,
      title: title.slice(0, 200),
      deal_price: prices[0],
      original_price: prices.length > 1 ? prices[prices.length - 1] : null,
      discount_percent: prices.length > 1 ? Math.round(((prices[prices.length - 1] - prices[0]) / prices[prices.length - 1]) * 100) : null,
      deal_type: 'daily',
    })
    if (out.length >= 40) break
  }

  return out
}
