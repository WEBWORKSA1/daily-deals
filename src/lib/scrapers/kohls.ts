import type { RawDeal } from './types'
import { fetchHTML, stripTags, parsePrice, decodeHtmlEntities, extractAll } from './utils'

export async function scrapeKohls(): Promise<RawDeal[]> {
  const sourceUrl = 'https://www.kohls.com/sale-event/todays-deals.jsp'
  const html = await fetchHTML(sourceUrl)
  const out: RawDeal[] = []

  const tilePattern = /<a[^>]+href="(\/product\/prd-[^"]+)"[^>]*>([\s\S]{0,800}?)<\/a>/gi
  const tiles = extractAll(html, tilePattern)

  for (const tile of tiles) {
    const path = tile[1]
    const tileBody = tile[2]

    const titleMatch = tileBody.match(/<span[^>]*>([^<]{15,200})<\/span>/i) || tileBody.match(/title="([^"]+)"/i)
    if (!titleMatch) continue
    const title = decodeHtmlEntities(stripTags(titleMatch[1])).trim()
    if (title.length < 10) continue

    const prices = extractAll(tileBody, /\$\s?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)
      .map(m => parsePrice(m[0])).filter((p): p is number => p !== null).sort((a, b) => a - b)
    if (!prices.length) continue

    out.push({
      retailer_slug: 'kohls',
      retailer_name: "Kohl's",
      country: 'US',
      source_url: sourceUrl,
      product_url: path.startsWith('http') ? path : `https://www.kohls.com${path}`,
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
