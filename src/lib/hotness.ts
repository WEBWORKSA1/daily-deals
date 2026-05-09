// Hotness scoring algorithm for deals
// Based on the formulas Slickdeals, DealNews, and Reddit use for ranking
// Score range: 0-100. Higher = hotter.

export interface DealForScoring {
  id: number
  click_count: number
  view_count?: number
  save_count?: number
  discount_percent: number | null
  original_price: number | null
  deal_price: number
  is_featured: boolean
  is_editors_choice?: boolean
  deal_type: string
  expires_at: string | null
  created_at: string
}

const NOW = () => Date.now()
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export function computeHotness(deal: DealForScoring): number {
  let score = 0

  // 1. ENGAGEMENT (40% of score) — clicks + views + saves
  // Log scale to prevent runaway from one viral deal
  const engagementRaw = (deal.click_count || 0) * 3 + (deal.view_count || 0) * 1 + (deal.save_count || 0) * 5
  const engagementScore = Math.min(40, Math.log10(engagementRaw + 1) * 12)
  score += engagementScore

  // 2. DISCOUNT QUALITY (25% of score)
  const discount = deal.discount_percent || 0
  let discountScore = 0
  if (discount >= 70) discountScore = 25
  else if (discount >= 50) discountScore = 22
  else if (discount >= 40) discountScore = 18
  else if (discount >= 30) discountScore = 14
  else if (discount >= 20) discountScore = 10
  else if (discount >= 10) discountScore = 5
  score += discountScore

  // 3. RECENCY DECAY (20% of score)
  // Newer deals get more weight, decay over 7 days
  const ageMs = NOW() - new Date(deal.created_at).getTime()
  const ageDays = ageMs / DAY
  let recencyScore = 0
  if (ageDays < 1) recencyScore = 20      // < 24h: full
  else if (ageDays < 2) recencyScore = 16  // < 48h
  else if (ageDays < 4) recencyScore = 12  // < 4d
  else if (ageDays < 7) recencyScore = 8   // < 7d
  else if (ageDays < 14) recencyScore = 4  // < 14d
  else recencyScore = 1                    // older
  score += recencyScore

  // 4. URGENCY BOOST (10% of score)
  // Deals about to expire get a final push
  if (deal.expires_at) {
    const expiresMs = new Date(deal.expires_at).getTime() - NOW()
    if (expiresMs > 0 && expiresMs < 6 * HOUR) score += 10        // < 6h left
    else if (expiresMs > 0 && expiresMs < 24 * HOUR) score += 7   // < 24h left
    else if (expiresMs > 0 && expiresMs < 3 * DAY) score += 3     // < 3d left
  }

  // 5. EDITORIAL BOOSTS (5% of score)
  if (deal.is_editors_choice) score += 5
  else if (deal.is_featured) score += 3

  // 6. DEAL TYPE BONUS
  if (deal.deal_type === 'flash') score += 3
  if (deal.deal_type === 'clearance') score += 2

  return Math.max(0, Math.min(100, Math.round(score)))
}

// Visual tier from score
export function hotnessTier(score: number): {
  label: string
  emoji: string
  color: string
  textColor: string
} {
  if (score >= 80) return { label: 'BLAZING',   emoji: '🔥🔥', color: '#E8222A', textColor: '#fff' }
  if (score >= 65) return { label: 'HOT',       emoji: '🔥',    color: '#F5A623', textColor: '#000' }
  if (score >= 45) return { label: 'TRENDING',  emoji: '📈',    color: '#22C55E', textColor: '#fff' }
  if (score >= 25) return { label: 'WARM',      emoji: '✨',    color: '#3B82F6', textColor: '#fff' }
  return { label: 'NEW', emoji: '🆕', color: '#888', textColor: '#fff' }
}
