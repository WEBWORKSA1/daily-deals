import type { RawDeal } from './types'
import { fetchHTML, stripTags, parsePrice, decodeHtmlEntities, extractAll } from './utils'

export async function scrapeNewegg(): Promise<RawDeal[]> {
  const sourceUrl = 'https://www.newegg.com/todays-deals'
  const html = await fetchHTML(sourceUrl)
  const out: RawDeal[] = []

  const tilePattern = /<a[^>]+class="item-title"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  const tiles = extractAll(html, tilePattern)

  for (const tile of tiles) {
    const url = tile[1]
    const titleHtml = tile[2]
    const title = decodeHtmlEntities(stripTags(titleHtml)).trim()
    if (title.length < 10) continue

    // Newegg's price is in a sibling block; extract from broader window around the tile
    const fullTileMatch = html.indexOf(tile[0])
    if (fullTileMatch === -1) continue
    const window = html.slice(fullTileMatch, fullTileMatch + 2000)
    const prices = extractAll(window, /\$\s?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)
      .map(m => parsePrice(m[0])).filter((p): p is number => p !== null).sort((a, b) => a - b)
    if (!prices.length) continue

    out.push({
      retailer_slug: 'newegg',
      retailer_name: 'Newegg',
      country: 'US',
      source_url: sourceUrl,
      product_url: url.startsWith('http') ? url : `https://www.newegg.com${url}`,
      title: title.slice(0, 200),
      deal_price: prices[0],
      original_price: prices.length > 1 ? prices[prices.length - 1] : null,
      discount_percent: prices.length > 1 ? Math.round(((prices[prices.length - 1] - prices[0]) / prices[prices.length - 1]) * 100) : null,
      deal_type: 'flash',
    })
    if (out.length >= 50) break
  }

  return out
}
