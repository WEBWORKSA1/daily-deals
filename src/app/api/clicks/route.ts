import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { deal_id, user_country, user_city, user_postal } = await req.json()
    if (!deal_id) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

    await supabase.from('deal_clicks').insert({
      deal_id, user_country, user_city, user_postal,
      referrer: req.headers.get('referer')
    })

    await supabase.rpc('increment_click_count', { deal_id_input: deal_id })

    const { data: deal } = await supabase
      .from('deals')
      .select('affiliate_url')
      .eq('id', deal_id)
      .single()

    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    return NextResponse.json({ url: deal.affiliate_url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
