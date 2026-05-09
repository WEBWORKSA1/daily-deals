import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Smart search: matches across title, description, retailer name, category
// Supports filters: ?q=&category=&retailer=&country=&min_discount=&max_price=&sort=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const category = searchParams.get('category')
  const retailer = searchParams.get('retailer')
  const country = searchParams.get('country') // 'US', 'CA', or null
  const minDiscount = parseInt(searchParams.get('min_discount') || '0')
  const maxPrice = parseFloat(searchParams.get('max_price') || '999999')
  const sort = searchParams.get('sort') || 'relevance' // relevance | hottest | discount | newest | price_asc
  const limit = Math.min(parseInt(searchParams.get('limit') || '40'), 100)

  let query = supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color, affiliate_net, country)')
    .eq('is_active', true)

  // Text search across multiple fields
  if (q.length > 0) {
    // Postgres full-text-ish: ilike on multiple columns OR'd together
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
  }

  // Category filter
  if (category) query = query.ilike('category', `%${category}%`)

  // Country filter
  if (country) query = query.in('country', [country, 'BOTH'])

  // Discount minimum
  if (minDiscount > 0) query = query.gte('discount_percent', minDiscount)

  // Max price
  if (maxPrice < 999999) query = query.lte('deal_price', maxPrice)

  // Sort
  switch (sort) {
    case 'hottest':
      query = query.order('hotness_score', { ascending: false }).order('discount_percent', { ascending: false })
      break
    case 'discount':
      query = query.order('discount_percent', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('deal_price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('deal_price', { ascending: false })
      break
    default: // relevance
      query = query.order('hotness_score', { ascending: false }).order('discount_percent', { ascending: false })
  }

  query = query.limit(limit)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filter retailer by slug match in JS (Supabase joined filter is complex)
  let results = data || []
  if (retailer) {
    results = results.filter((d: any) => d.retailers?.slug === retailer)
  }

  // Map response shape
  const mapped = results.map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
    retailer_brand_color: d.retailers?.brand_color,
    affiliate_net: d.retailers?.affiliate_net,
  }))

  return NextResponse.json({
    query: q,
    filters: { category, retailer, country, minDiscount, maxPrice, sort },
    count: mapped.length,
    deals: mapped,
  })
}
