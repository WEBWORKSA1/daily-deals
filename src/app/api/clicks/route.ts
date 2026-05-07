import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { deal_id, user_country, user_city, user_postal } = await req.json()
    if (!deal_id) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })
    await query(`INSERT INTO deal_clicks (deal_id, user_country, user_city, user_postal, referrer) VALUES (?, ?, ?, ?, ?)`,
      [deal_id, user_country || null, user_city || null, user_postal || null, req.headers.get('referer') || null])
    await query(`UPDATE deals SET click_count = click_count + 1 WHERE id = ?`, [deal_id])
    const deal = await queryOne<{ affiliate_url: string }>(`SELECT affiliate_url FROM deals WHERE id = ?`, [deal_id])
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    return NextResponse.json({ url: deal.affiliate_url })
  } catch (err) {
    console.error('Click error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
