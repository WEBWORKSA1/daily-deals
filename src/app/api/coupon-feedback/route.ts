import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

function hashIp(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
        || req.headers.get('x-real-ip')
        || 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

// Submit coupon feedback (worked / didn't work)
export async function POST(req: NextRequest) {
  try {
    const { deal_id, worked } = await req.json()
    if (!deal_id || typeof worked !== 'boolean')
      return NextResponse.json({ error: 'deal_id and worked (boolean) required' }, { status: 400 })

    const dealId = parseInt(deal_id)
    const user = await getUserFromRequest(req)
    const ipHash = hashIp(req)

    // Dedup: same user OR same IP within 24h cannot vote twice on same deal
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    let existing: any = null
    if (user) {
      const { data } = await supabase
        .from('coupon_feedback')
        .select('id, worked')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .gt('created_at', cutoff)
        .single()
      existing = data
    } else {
      const { data } = await supabase
        .from('coupon_feedback')
        .select('id, worked')
        .eq('deal_id', dealId)
        .eq('ip_hash', ipHash)
        .gt('created_at', cutoff)
        .single()
      existing = data
    }

    if (existing) {
      // Update existing rather than create new
      if (existing.worked !== worked) {
        await supabase
          .from('coupon_feedback')
          .update({ worked, created_at: new Date().toISOString() })
          .eq('id', existing.id)
        await recalculateRate(dealId)
      }
    } else {
      await supabase.from('coupon_feedback').insert({
        deal_id: dealId,
        user_id: user?.id || null,
        worked,
        ip_hash: ipHash,
      })
      await recalculateRate(dealId)
    }

    // Return current rate
    const { data: deal } = await supabase
      .from('deals')
      .select('coupon_works_count, coupon_fails_count, coupon_success_rate')
      .eq('id', dealId)
      .single()

    return NextResponse.json({ success: true, ...(deal || {}) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Get coupon stats for a deal
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get('deal_id')
  if (!dealId) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

  try {
    const { data: deal } = await supabase
      .from('deals')
      .select('coupon_works_count, coupon_fails_count, coupon_success_rate, coupon_code')
      .eq('id', parseInt(dealId))
      .single()
    return NextResponse.json(deal || {})
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function recalculateRate(dealId: number) {
  try {
    const { count: works } = await supabase
      .from('coupon_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', dealId)
      .eq('worked', true)

    const { count: fails } = await supabase
      .from('coupon_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', dealId)
      .eq('worked', false)

    const w = works || 0
    const f = fails || 0
    const total = w + f
    const rate = total > 0 ? Math.round((w / total) * 100) : 0

    await supabase.from('deals').update({
      coupon_works_count: w,
      coupon_fails_count: f,
      coupon_success_rate: rate,
    }).eq('id', dealId)
  } catch {}
}
