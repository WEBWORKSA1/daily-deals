import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { buildAffiliateLink } from '@/lib/utils'
import { getUserFromRequest } from '@/lib/auth'
import { recordCashbackClick } from '@/lib/cashback'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const dealId = parseInt(body.deal_id, 10)
    if (!dealId || isNaN(dealId)) {
      return NextResponse.json({ error: 'deal_id required' }, { status: 400 })
    }

    // Log the click for analytics
    await supabase.from('deal_clicks').insert({
      deal_id: dealId,
      user_country: body.user_country,
      user_city: body.user_city,
      user_postal: body.user_postal,
      referrer: req.headers.get('referer'),
    }).then(() => {}, () => {}) // fire-and-forget

    // Bump click_count via RPC
    supabase.rpc('increment_click_count', { deal_id_input: dealId }).then(() => {}, () => {})

    // Fetch the deal AND retailer info so we can inject the right affiliate tag
    const { data: deal } = await supabase
      .from('deals')
      .select('affiliate_url, country, retailer_id, retailers(name, slug, affiliate_net, commission_rate, cashback_rate)')
      .eq('id', dealId)
      .single()

    if (!deal) return NextResponse.json({ error: 'deal_not_found' }, { status: 404 })

    const r: any = (deal as any).retailers || {}
    const dealForLink = {
      ...deal,
      affiliate_net: r.affiliate_net,
      country: (deal as any).country || 'US',
    } as any

    // Build the tracking-augmented affiliate URL
    let trackedUrl = buildAffiliateLink(dealForLink, r.affiliate_net || 'direct')

    // If user is signed in, also create a cashback event so we can credit them later
    const user = await getUserFromRequest(req).catch(() => null)
    if (user && (deal as any).retailer_id && r.cashback_rate > 0) {
      try {
        const { click_id } = await recordCashbackClick({
          userId: user.id,
          dealId: dealId,
          retailerId: (deal as any).retailer_id,
          cashbackRate: Number(r.cashback_rate),
        })
        // Append our click_id as a sub-id parameter so the affiliate network
        // can return it in conversion postbacks
        try {
          const u = new URL(trackedUrl)
          // Different networks use different subId param names — set the common ones
          u.searchParams.set('subid', click_id)
          u.searchParams.set('sid', click_id)
          u.searchParams.set('utm_content', click_id)
          trackedUrl = u.toString()
        } catch {}
      } catch (e) {
        console.error('cashback click record failed', e)
      }
    }

    return NextResponse.json({
      url: trackedUrl,
      retailer: r.name || null,
      cashback_rate: Number(r.cashback_rate || 0),
      cashback_eligible: !!user && Number(r.cashback_rate || 0) > 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
