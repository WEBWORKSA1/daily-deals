// AI Deal Scout — auto-discovers deals from public RSS feeds + structured retailer pages
// Architecture: scheduled job (or admin endpoint) fetches feeds, parses items, scores each
// against your category/quality rules, inserts approved deals as "pending" status.
//
// You manually review the queue and approve. Or set auto_approve=true if you trust it.

import { supabase } from './db'

export interface ScoutCandidate {
  source_url: string
  source_name: string
  title: string
  description: string | null
  image_url: string | null
  price: number | null
  original_price: number | null
  retailer_slug: string | null
  category: string | null
  affiliate_url: string
  raw: any
}

// Feeds we know are reliable. Add more over time.
// Many deal sites publish public RSS feeds with affiliate tracking we can substitute.
export const SCOUT_FEEDS: Array<{
  name: string
  url: string
  type: 'rss' | 'json'
  category_hint?: string
}> = [
  // Add curated feed URLs here as you discover them.
  // Example: { name: 'Slickdeals Frontpage', url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1', type: 'rss' },
]

// Quality scoring for a candidate (0-100). Higher = more likely a good deal.
export function scoreScoutCandidate(c: ScoutCandidate): number {
  let score = 0

  // Has price + original price = strong signal
  if (c.price && c.original_price) {
    score += 30
    const discount = ((c.original_price - c.price) / c.original_price) * 100
    if (discount >= 50) score += 25
    else if (discount >= 30) score += 18
    else if (discount >= 20) score += 12
    else if (discount >= 10) score += 6
  } else if (c.price) {
    score += 10
  }

  // Has image
  if (c.image_url) score += 10

  // Has description
  if (c.description && c.description.length > 30) score += 8

  // Has retailer mapping
  if (c.retailer_slug) score += 12

  // Has category mapping
  if (c.category) score += 7

  // Title quality (heuristic: not too short, not all caps)
  if (c.title.length > 15 && c.title.length < 200) score += 5
  if (c.title === c.title.toUpperCase()) score -= 5

  return Math.max(0, Math.min(100, score))
}

// Map raw RSS title/description to our retailer slug if possible
const RETAILER_KEYWORDS: Record<string, string[]> = {
  amazon: ['amazon', 'amzn'],
  walmart: ['walmart'],
  bestbuy: ['best buy', 'bestbuy'],
  target: ['target.com'],
  costco: ['costco'],
  homedepot: ['home depot'],
  lowes: ['lowes', "lowe's"],
  apple: ['apple.com', 'apple store'],
  nike: ['nike.com'],
  sephora: ['sephora'],
  ulta: ['ulta'],
  macys: ["macy's", 'macys'],
  nordstrom: ['nordstrom'],
  ebay: ['ebay'],
}

export function detectRetailer(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [slug, keywords] of Object.entries(RETAILER_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return slug
  }
  return null
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Electronics: ['tv', 'laptop', 'monitor', 'headphone', 'speaker', 'camera', 'phone', 'tablet', 'ssd', 'gaming'],
  Fashion: ['shoes', 'shirt', 'jacket', 'pants', 'dress', 'apparel', 'clothing'],
  Beauty: ['mascara', 'lipstick', 'serum', 'cream', 'fragrance', 'perfume', 'cosmetics', 'skincare'],
  Home: ['furniture', 'sofa', 'bed', 'kitchen', 'cookware', 'rug', 'lamp'],
  Sports: ['fitness', 'yoga', 'bike', 'tent', 'camping', 'hiking', 'running'],
  Tools: ['drill', 'saw', 'tool kit', 'wrench', 'hardware'],
  Toys: ['toy', 'lego', 'doll', 'puzzle', 'game'],
  Grocery: ['grocery', 'snacks', 'beverage', 'coffee', 'tea'],
  Books: ['book', 'kindle', 'novel'],
  Pet: ['dog', 'cat', 'pet food', 'litter'],
}

export function detectCategory(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return null
}

// Extract price from text like "$49.99", "Now $29", "Save $50"
export function extractPrice(text: string): number | null {
  const match = text.match(/\$\s?(\d{1,5}(?:[,.]\d{2})?)/i)
  if (!match) return null
  const v = parseFloat(match[1].replace(',', '.'))
  return isNaN(v) ? null : v
}

// Process a candidate: score it, optionally save it as pending
export async function processCandidate(
  c: ScoutCandidate,
  options: { auto_approve_above?: number, min_score?: number } = {}
): Promise<{ saved: boolean, score: number, dealId?: number, reason?: string }> {
  const score = scoreScoutCandidate(c)
  const minScore = options.min_score ?? 50

  if (score < minScore) {
    return { saved: false, score, reason: 'below quality threshold' }
  }

  // Find or skip retailer
  let retailerId: number | null = null
  if (c.retailer_slug) {
    const { data: r } = await supabase
      .from('retailers').select('id').eq('slug', c.retailer_slug).single()
    if (r) retailerId = (r as any).id
  }

  // Skip if no retailer match — too risky to insert orphan deals
  if (!retailerId) return { saved: false, score, reason: 'no retailer match' }

  // Compute discount %
  let discount: number | null = null
  if (c.original_price && c.price) {
    discount = Math.round(((c.original_price - c.price) / c.original_price) * 100)
  }

  const autoApprove = options.auto_approve_above && score >= options.auto_approve_above

  try {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        title: c.title.slice(0, 200),
        description: c.description?.slice(0, 1000) || null,
        deal_price: c.price,
        original_price: c.original_price,
        discount_percent: discount,
        retailer_id: retailerId,
        category: c.category || 'Other',
        image_url: c.image_url,
        affiliate_url: c.affiliate_url,
        country: 'BOTH',
        deal_type: 'daily',
        is_active: !!autoApprove,                 // pending if not auto-approved
        is_featured: false,
        is_national: true,
        is_online: true,
        click_count: 0,
      })
      .select('id')
      .single()

    if (error) return { saved: false, score, reason: error.message }
    return { saved: true, score, dealId: (data as any).id }
  } catch (e: any) {
    return { saved: false, score, reason: e.message }
  }
}
