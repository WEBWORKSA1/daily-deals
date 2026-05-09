// /api/cashback/confirm — admin only, confirms a pending cashback event after retailer sale report

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { confirmCashback } from '@/lib/cashback'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { click_id, confirmed_purchase_amount } = await request.json()
  if (!click_id || !confirmed_purchase_amount) {
    return NextResponse.json({ error: 'click_id and confirmed_purchase_amount required' }, { status: 400 })
  }

  const result = await confirmCashback({ click_id, confirmed_purchase_amount })
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
