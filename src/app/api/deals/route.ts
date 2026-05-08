import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country  = searchParams.get('country')
  const category = searchParams.get('category')
  const retailer = searchParams.get('retailer')
  const dealType = searchParams.get('deal_type')
  const featured = searchParams.get('featured')
  const national = searchParams.get('national')
  const limit    = Math.min(Number(searchParams.get('limit') || 20), 100)
  const offset   = Number(searchParams.get('offset') || 0)

  try {
    let q = supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('discount_percent', { ascending: false })

    if (country && country !== 'BOTH') q = q.in('country', [country, 'BOTH'])
    if (category) q = q.eq('category', category)
    if (dealType)  q = q.eq('deal_type', dealType)
    if (featured === '1') q = q.eq('is_featured', true)
    if (national === '1') q = q.eq('is_national', true)

    const { data, error } = await q
    if (error) throw error

    const deals = (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
    }))

    return NextResponse.json({ deals, count: deals.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
