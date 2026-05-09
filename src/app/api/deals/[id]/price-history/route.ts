import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/deals/[id]/price-history - returns price history for a deal
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'invalid_deal_id' }, { status: 400 })
  }

  // Fetch the deal's current state for context
  const { data: deal } = await supabase
    .from('deals')
    .select('id, current_price, original_price, lowest_price_ever, highest_price_ever, avg_price_30d, price_trend')
    .eq('id', dealId)
    .single()

  if (!deal) {
    return NextResponse.json({ error: 'deal_not_found' }, { status: 404 })
  }

  // Fetch history (last 90 days)
  const { data: history } = await supabase
    .from('deal_price_history')
    .select('price, original_price, discount_percent, recorded_at')
    .eq('deal_id', dealId)
    .gte('recorded_at', new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString())
    .order('recorded_at', { ascending: true })

  // If no history yet, synthesize a single point from current price
  let points = history || []
  if (points.length === 0 && deal.current_price) {
    points = [{
      price: deal.current_price,
      original_price: deal.original_price,
      discount_percent: null,
      recorded_at: new Date().toISOString(),
    }]
  }

  return NextResponse.json({
    deal_id: dealId,
    current: {
      price: deal.current_price,
      original_price: deal.original_price,
    },
    stats: {
      lowest_ever: deal.lowest_price_ever,
      highest_ever: deal.highest_price_ever,
      avg_30d: deal.avg_price_30d,
      trend: deal.price_trend || 'stable',
    },
    history: points,
    point_count: points.length,
  })
}

// POST /api/deals/[id]/price-history - record a price snapshot (admin/cron use)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'invalid_deal_id' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const price = parseFloat(body.price)
  const originalPrice = body.original_price ? parseFloat(body.original_price) : null

  if (isNaN(price)) {
    return NextResponse.json({ error: 'invalid_price' }, { status: 400 })
  }

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  const { data, error } = await supabase
    .from('deal_price_history')
    .insert({
      deal_id: dealId,
      price,
      original_price: originalPrice,
      discount_percent: discountPercent,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Recompute aggregate stats
  const { data: allHistory } = await supabase
    .from('deal_price_history')
    .select('price, recorded_at')
    .eq('deal_id', dealId)

  if (allHistory && allHistory.length > 0) {
    const prices = allHistory.map((h: any) => parseFloat(h.price))
    const lowest = Math.min(...prices)
    const highest = Math.max(...prices)

    const last30Days = allHistory.filter((h: any) =>
      new Date(h.recorded_at).getTime() > Date.now() - 30 * 24 * 3600 * 1000
    )
    const avg30d = last30Days.length > 0
      ? last30Days.reduce((s: number, h: any) => s + parseFloat(h.price), 0) / last30Days.length
      : null

    // Detect trend
    let trend = 'stable'
    if (allHistory.length >= 2) {
      const recent = prices.slice(-3).reduce((s, p) => s + p, 0) / Math.min(3, prices.length)
      const older = prices.slice(0, -3).reduce((s, p) => s + p, 0) / Math.max(1, prices.length - 3)
      if (recent < older * 0.95) trend = 'falling'
      else if (recent > older * 1.05) trend = 'rising'
    }

    await supabase
      .from('deals')
      .update({
        lowest_price_ever: lowest,
        highest_price_ever: highest,
        avg_price_30d: avg30d,
        price_trend: trend,
      })
      .eq('id', dealId)
  }

  return NextResponse.json({ ok: true, snapshot: data })
}
