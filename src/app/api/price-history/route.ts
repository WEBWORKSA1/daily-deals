import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Get price history for a deal
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get('deal_id')
  if (!dealId) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

  try {
    const { data: history } = await supabase
      .from('deal_price_history')
      .select('price, original_price, discount_percent, recorded_at')
      .eq('deal_id', parseInt(dealId))
      .order('recorded_at', { ascending: true })
      .limit(180) // ~6 months

    const { data: deal } = await supabase
      .from('deals')
      .select('deal_price, original_price, lowest_price_ever, highest_price_ever, avg_price_30d, price_trend')
      .eq('id', parseInt(dealId))
      .single()

    return NextResponse.json({
      history: history || [],
      stats: deal || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
