import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Autocomplete: returns up to 8 deals + 4 retailers + 3 categories
// matching the partial query.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  if (q.length < 2) return NextResponse.json({ deals: [], retailers: [], categories: [] })

  const [dealsRes, retailersRes] = await Promise.all([
    supabase
      .from('deals')
      .select('id, title, deal_price, discount_percent, image_url, retailers(name, slug)')
      .eq('is_active', true)
      .ilike('title', `%${q}%`)
      .order('hotness_score', { ascending: false })
      .limit(8),
    supabase
      .from('retailers')
      .select('id, name, slug, logo_url, brand_color, country')
      .eq('is_active', true)
      .ilike('name', `%${q}%`)
      .limit(4),
  ])

  const matchedCategories = [
    'Electronics', 'Fashion', 'Beauty', 'Home', 'Sports', 'Tools', 'Toys',
    'Grocery', 'Books', 'Travel', 'Health', 'Automotive', 'Pet', 'Kitchen'
  ].filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 3)

  const deals = (dealsRes.data || []).map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
  }))

  return NextResponse.json({
    query: q,
    deals,
    retailers: retailersRes.data || [],
    categories: matchedCategories,
  })
}
