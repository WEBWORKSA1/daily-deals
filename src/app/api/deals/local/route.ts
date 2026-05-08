import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getAnchor, distanceKm } from '@/lib/storeAnchors'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const country = searchParams.get('country') || 'BOTH'

  const { data, error } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color, affiliate_net, country)')
    .eq('is_active', true)
    .order('discount_percent', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const allDeals = (data || []).map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
    retailer_brand_color: d.retailers?.brand_color,
    affiliate_net: d.retailers?.affiliate_net,
  }))

  const local: any[] = []
  const nearby: any[] = []
  const national: any[] = []

  // No location set → return top national deals
  if (!lat || !lng) {
    const filtered = allDeals.filter((d: any) =>
      country === 'BOTH' || d.country === country || d.country === 'BOTH'
    )
    return NextResponse.json({ local: [], nearby: [], national: filtered.slice(0, 8) })
  }

  // Classify each deal by retailer's anchor distance
  for (const deal of allDeals) {
    const anchor = getAnchor(deal.retailer_slug)
    if (!anchor || anchor.online) {
      // Online retailer — national tier (must match user's country)
      if (country === 'BOTH' || deal.country === country || deal.country === 'BOTH') {
        national.push(deal)
      }
      continue
    }

    const dist = distanceKm(lat, lng, anchor.lat, anchor.lng)
    const dealWithDist = {
      ...deal,
      distance_km: Math.round(dist * 10) / 10,
      store_city: anchor.city,
    }
    if (dist <= 5) local.push(dealWithDist)
    else if (dist <= 50) nearby.push(dealWithDist)
    else {
      // Out of radius — fall to national IF country matches
      if (country === 'BOTH' || deal.country === country || deal.country === 'BOTH') {
        national.push(deal)
      }
    }
  }

  return NextResponse.json({
    local: local.slice(0, 4),
    nearby: nearby.slice(0, 4),
    national: national.slice(0, 4),
  })
}
