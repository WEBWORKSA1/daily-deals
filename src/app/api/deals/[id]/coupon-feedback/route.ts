import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/deals/[id]/coupon-feedback - vote on whether coupon worked
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'invalid_deal_id' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const worked = body.worked === true || body.worked === 'true'

  // Hash the IP for dedup without storing PII
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32)

  const user = await getUserFromRequest(req)

  // Dedup check: same IP/user can't vote twice on same deal in 24h
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  let dupQuery = supabase
    .from('coupon_feedback')
    .select('id')
    .eq('deal_id', dealId)
    .gte('created_at', dayAgo)

  if (user) {
    dupQuery = dupQuery.eq('user_id', user.id)
  } else {
    dupQuery = dupQuery.eq('ip_hash', ipHash)
  }

  const { data: existing } = await dupQuery.limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'already_voted', message: 'You already voted on this coupon today' }, { status: 409 })
  }

  // Insert feedback
  const { error: insertErr } = await supabase
    .from('coupon_feedback')
    .insert({
      deal_id: dealId,
      user_id: user?.id || null,
      worked,
      ip_hash: ipHash,
    })

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // Recompute success rate
  const { data: allFeedback } = await supabase
    .from('coupon_feedback')
    .select('worked')
    .eq('deal_id', dealId)

  const total = allFeedback?.length || 0
  const works = allFeedback?.filter((f: any) => f.worked).length || 0
  const fails = total - works
  const rate = total > 0 ? Math.round((works / total) * 100) : 0

  await supabase
    .from('deals')
    .update({
      coupon_works_count: works,
      coupon_fails_count: fails,
      coupon_success_rate: rate,
    })
    .eq('id', dealId)

  return NextResponse.json({
    ok: true,
    worked,
    stats: { works, fails, total, rate },
  })
}

// GET /api/deals/[id]/coupon-feedback - get current stats
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'invalid_deal_id' }, { status: 400 })
  }

  const { data: deal } = await supabase
    .from('deals')
    .select('coupon_works_count, coupon_fails_count, coupon_success_rate')
    .eq('id', dealId)
    .single()

  if (!deal) {
    return NextResponse.json({ error: 'deal_not_found' }, { status: 404 })
  }

  return NextResponse.json({
    works: deal.coupon_works_count || 0,
    fails: deal.coupon_fails_count || 0,
    total: (deal.coupon_works_count || 0) + (deal.coupon_fails_count || 0),
    rate: deal.coupon_success_rate || 0,
  })
}
