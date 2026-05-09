// /api/cashback — GET user's cashback summary, POST to record a click

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { recordCashbackClick, getUserCashback } from '@/lib/cashback'

export const dynamic = 'force-dynamic'

// GET — return user's cashback summary
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const summary = await getUserCashback(user.id)
  return NextResponse.json({ ok: true, ...summary })
}

// POST — record a click that's eligible for cashback
// Body: { deal_id }
// Returns: { click_id, affiliate_url } — append click_id as a tracking param to affiliate_url
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { deal_id } = await request.json()
  if (!deal_id) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

  // Get deal + retailer
  const { data: deal } = await supabase
    .from('deals')
    .select('id, affiliate_url, retailer_id, retailers(cashback_rate, name, slug)')
    .eq('id', deal_id)
    .single()

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const retailer = (deal as any).retailers
  const cashbackRate = retailer?.cashback_rate || 0

  if (cashbackRate <= 0) {
    return NextResponse.json({
      ok: true,
      eligible: false,
      affiliate_url: (deal as any).affiliate_url,
      reason: 'no cashback for this retailer'
    })
  }

  const { click_id } = await recordCashbackClick({
    userId: user.id,
    dealId: deal_id,
    retailerId: (deal as any).retailer_id,
    cashbackRate,
  })

  // Append click_id as tracking param
  const url = new URL((deal as any).affiliate_url)
  url.searchParams.set('dd_click', click_id)

  return NextResponse.json({
    ok: true,
    eligible: true,
    cashback_rate: cashbackRate,
    click_id,
    affiliate_url: url.toString(),
    retailer_name: retailer?.name,
  })
}
