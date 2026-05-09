// Price history tracking + computation
// Records every price change, computes lowest/highest/avg, classifies trend

import { supabase } from './db'

export type PriceTrend = 'lowest_ever' | 'falling' | 'stable' | 'rising' | 'highest_ever'

export interface PricePoint {
  price: number
  original_price: number | null
  discount_percent: number | null
  recorded_at: string
}

// Snapshot a deal's current price into history (call when price changes)
export async function recordPriceSnapshot(dealId: number) {
  try {
    const { data: deal } = await supabase
      .from('deals')
      .select('deal_price, original_price, discount_percent')
      .eq('id', dealId)
      .single()
    if (!deal) return

    const d: any = deal

    // Get last snapshot to avoid duplicates
    const { data: lastSnap } = await supabase
      .from('deal_price_history')
      .select('price, recorded_at')
      .eq('deal_id', dealId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    const lastPrice = (lastSnap as any)?.price
    if (lastPrice && Math.abs(lastPrice - d.deal_price) < 0.01) return // unchanged

    await supabase.from('deal_price_history').insert({
      deal_id: dealId,
      price: d.deal_price,
      original_price: d.original_price,
      discount_percent: d.discount_percent,
    })

    await recalculateDealPriceStats(dealId)
  } catch (e) {
    // silent — not worth interrupting user flow
  }
}

// Recalculate aggregated stats: lowest, highest, avg_30d, trend
export async function recalculateDealPriceStats(dealId: number) {
  try {
    const { data: history } = await supabase
      .from('deal_price_history')
      .select('price, recorded_at')
      .eq('deal_id', dealId)
      .order('recorded_at', { ascending: false })
      .limit(100)

    const points = (history || []) as any[]
    if (points.length === 0) return

    const prices = points.map(p => Number(p.price)).filter(p => !isNaN(p))
    if (prices.length === 0) return

    const lowest = Math.min(...prices)
    const highest = Math.max(...prices)

    // 30-day average
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recent = points.filter(p => new Date(p.recorded_at).getTime() > cutoff)
    const recentPrices = recent.map(p => Number(p.price)).filter(p => !isNaN(p))
    const avg30 = recentPrices.length > 0
      ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
      : null

    // Trend classification
    const currentPrice = prices[0] // most recent
    let trend: PriceTrend = 'stable'

    if (Math.abs(currentPrice - lowest) < 0.01) {
      trend = 'lowest_ever'
    } else if (Math.abs(currentPrice - highest) < 0.01 && prices.length > 1) {
      trend = 'highest_ever'
    } else if (recentPrices.length >= 3) {
      // Compare last 3 prices
      const last3 = recentPrices.slice(0, 3)
      if (last3[0] < last3[2] * 0.95) trend = 'falling'
      else if (last3[0] > last3[2] * 1.05) trend = 'rising'
    }

    await supabase.from('deals').update({
      lowest_price_ever: lowest,
      highest_price_ever: highest,
      avg_price_30d: avg30,
      price_trend: trend,
    }).eq('id', dealId)
  } catch (e) {
    // silent
  }
}

// Classify how good the current price is (1-5 stars)
export function priceQualityRating(deal: any): {
  stars: number
  label: string
  color: string
  isLowestEver: boolean
} {
  const current = Number(deal.deal_price)
  const lowest = Number(deal.lowest_price_ever || current)
  const highest = Number(deal.highest_price_ever || current)
  const avg = Number(deal.avg_price_30d || current)

  // If we have no real history yet, use discount % as proxy
  if (highest <= current || highest === lowest) {
    const discount = deal.discount_percent || 0
    if (discount >= 50) return { stars: 5, label: 'Excellent', color: '#22C55E', isLowestEver: false }
    if (discount >= 30) return { stars: 4, label: 'Great', color: '#22C55E', isLowestEver: false }
    if (discount >= 20) return { stars: 3, label: 'Good', color: '#F5A623', isLowestEver: false }
    if (discount >= 10) return { stars: 2, label: 'Fair', color: '#F5A623', isLowestEver: false }
    return { stars: 1, label: 'OK', color: '#888', isLowestEver: false }
  }

  // We have history — compare to actual data
  const isLowestEver = Math.abs(current - lowest) < 0.01
  const range = highest - lowest
  const positionInRange = range > 0 ? (current - lowest) / range : 0

  if (isLowestEver) return { stars: 5, label: 'Lowest Ever', color: '#22C55E', isLowestEver: true }
  if (positionInRange < 0.15) return { stars: 5, label: 'Excellent', color: '#22C55E', isLowestEver: false }
  if (positionInRange < 0.35) return { stars: 4, label: 'Great', color: '#22C55E', isLowestEver: false }
  if (positionInRange < 0.6)  return { stars: 3, label: 'Good', color: '#F5A623', isLowestEver: false }
  if (positionInRange < 0.85) return { stars: 2, label: 'Fair', color: '#F5A623', isLowestEver: false }
  return { stars: 1, label: 'Above Average', color: '#888', isLowestEver: false }
}
