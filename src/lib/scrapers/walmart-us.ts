// Walmart US — Rollback / Flash Picks deals page.
// They serve embedded JSON state in __NEXT_DATA__ (Next.js apps). We grab it.

import type { RawDeal } from './types'
import { fetchHTML } from './utils'

export async function scrapeWalmartUS(): Promise<RawDeal[]> {
  return scrapeWalmartImpl('US', 'walmart-us', 'Walmart', 'https://www.walmart.com/shop/deals')
}

export async function scrapeWalmartImpl(
  country: 'US' | 'CA',
  slug: string,
  name: string,
  sourceUrl: string,
): Promise<RawDeal[]> {
  const html = await fetchHTML(sourceUrl)
  const out: RawDeal[] = []

  // __NEXT_DATA__ contains the full page state
  const m = html.match(/<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/)
  if (!m) return []

  let data: any
  try { data = JSON.parse(m[1]) } catch { return [] }

  // Walk the data tree looking for items with 'priceInfo' or 'price' + 'name'.
  // Walmart's structure is deeply nested and has changed over time — we walk it.
  const candidates: any[] = []
  function walk(node: any, depth = 0) {
    if (!node || depth > 20) return
    if (Array.isArray(node)) { node.forEach(n => walk(n, depth + 1)); return }
    if (typeof node !== 'object') return

    // A Walmart product node typically has: name + priceInfo (or price) + canonicalUrl/itemId
    if ((node.name || node.title) && (node.priceInfo || node.price) && (node.canonicalUrl || node.url || node.itemId)) {
      candidates.push(node)
    }
    for (const v of Object.values(node)) walk(v, depth + 1)
  }
  walk(data)

  for (const c of candidates) {
    const title = String(c.name || c.title || '').trim()
    if (!title || title.length < 10) continue

    // Price extraction
    let dealPrice: number | null = null
    let originalPrice: number | null = null

    if (c.priceInfo) {
      const pi = c.priceInfo
      dealPrice = parseFloat(pi.currentPrice?.price ?? pi.linePrice ?? pi.itemPrice ?? '0') || null
      originalPrice = parseFloat(pi.wasPrice?.price ?? pi.listPrice?.price ?? '0') || null
    } else if (c.price) {
      dealPrice = parseFloat(c.price.current ?? c.price ?? '0') || null
      originalPrice = parseFloat(c.price.was ?? c.price.list ?? '0') || null
    }
    if (!dealPrice || dealPrice <= 0) continue
    if (originalPrice && originalPrice <= dealPrice) originalPrice = null

    const baseHost = country === 'CA' ? 'https://www.walmart.ca' : 'https://www.walmart.com'
    const path = c.canonicalUrl || c.url || (c.itemId ? `/ip/${c.itemId}` : null)
    if (!path) continue
    const productUrl = path.startsWith('http') ? path : `${baseHost}${path}`

    const image = c.imageInfo?.thumbnailUrl || c.image?.url || c.imageUrl || null

    const discount = originalPrice && dealPrice
      ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
      : null

    out.push({
      retailer_slug: slug,
      retailer_name: name,
      country,
      source_url: sourceUrl,
      product_url: productUrl,
      title: title.slice(0, 200),
      image_url: image,
      deal_price: dealPrice,
      original_price: originalPrice,
      discount_percent: discount,
      deal_type: discount && discount >= 30 ? 'rollback' : 'daily',
    })

    if (out.length >= 60) break
  }

  return out
}
