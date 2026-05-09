import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
}

// POST /api/admin/process-alerts — match new deals against subscriber alerts
// For each active deal_alert with last_matched_at > 1 hour ago,
// find any deals matching the criteria and queue an email.
//
// NOTE: this only TAGS matches. Actual email send happens via a separate worker
// once an email provider (Resend/Postmark) is configured.
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Get active alerts that haven't been matched recently
    const { data: alerts, error: alertsErr } = await supabase
      .from('deal_alerts')
      .select(`
        id, subscriber_id, keyword, retailer_slug, category, min_discount, max_price,
        last_matched_at,
        email_subscribers!inner(email, confirmed)
      `)
      .eq('is_active', true)
      .or(`last_matched_at.is.null,last_matched_at.lt.${oneHourAgo}`)
      .limit(500)

    if (alertsErr) throw alertsErr
    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ ok: true, matched_alerts: 0 })
    }

    const newDealsCutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    let matched = 0
    const matches: Array<{ alert_id: number; deal_count: number; subscriber_email: string }> = []

    for (const alert of alerts) {
      const a: any = alert
      // Skip unconfirmed subscribers
      if (!a.email_subscribers?.confirmed) continue

      let q = supabase
        .from('deals')
        .select('id, title, deal_price, discount_percent', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', newDealsCutoff)

      if (a.keyword) q = q.ilike('title', `%${a.keyword}%`)
      if (a.retailer_slug) {
        // Need a different query path — get retailer ID first
        const { data: ret } = await supabase
          .from('retailers').select('id').eq('slug', a.retailer_slug).single()
        if (ret) q = q.eq('retailer_id', (ret as any).id)
      }
      if (a.category) q = q.eq('category', a.category)
      if (a.min_discount) q = q.gte('discount_percent', a.min_discount)
      if (a.max_price) q = q.lte('deal_price', a.max_price)

      const { count } = await q
      if (count && count > 0) {
        matched++
        matches.push({
          alert_id: a.id,
          deal_count: count,
          subscriber_email: a.email_subscribers.email,
        })
        await supabase
          .from('deal_alerts')
          .update({ last_matched_at: new Date().toISOString() })
          .eq('id', a.id)
      }
    }

    return NextResponse.json({
      ok: true,
      alerts_checked: alerts.length,
      matched_alerts: matched,
      // matches array used by email worker once configured
      matches: matches.slice(0, 10), // truncate for response size
      total_matches: matches.length,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req as any)
}
