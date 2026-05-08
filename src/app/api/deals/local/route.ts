import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Haversine distance in km
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const country = searchParams.get('country') || 'BOTH'

  // Fetch ALL active deals with retailer info
  const { data, error } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color, affiliate_net, country)')
    .eq('is_active', true)
    .order('discount_percent', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const allDeals = (data || []).map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
    retailer_brand_color: d.retailers?.brand_color,
    affiliate_net: d.retailers?.affiliate_net,
  }))

  // 3-tier classification
  const local: any[] = []      // ≤5km
  const nearby: any[] = []     // 5-50km
  const national: any[] = []   // online only or no geo

  if (!lat || !lng) {
    // No location — return all national online deals
    return NextResponse.json({
      local: [],
      nearby: [],
      national: allDeals.filter((d: any) =>
        d.is_online_only !== false && (country === 'BOTH' || d.country === country || d.country === 'BOTH')
      ).slice(0, 8),
    })
  }

  for (const deal of allDeals) {
    if (deal.is_online_only === false && deal.store_latitude && deal.store_longitude) {
      const dist = distanceKm(lat, lng, deal.store_latitude, deal.store_longitude)
      const dealWithDist = { ...deal, distance_km: Math.round(dist * 10) / 10 }
      if (dist <= 5) local.push(dealWithDist)
      else if (dist <= 50) nearby.push(dealWithDist)
      else national.push(deal)
    } else {
      // Online or unmapped — national tier
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
