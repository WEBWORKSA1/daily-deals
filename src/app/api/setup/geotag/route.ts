import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// One-time geo-tagging of existing deals
// Picks a "primary store" location for each deal based on retailer + country
export async function GET() {
  // Get all active deals with retailer info
  const { data: deals, error: dealsErr } = await supabase
    .from('deals')
    .select('id, title, retailer_id, country, retailers(slug, name)')
    .eq('is_active', true)

  if (dealsErr) return NextResponse.json({ error: dealsErr.message }, { status: 500 })

  // Anchor stores per retailer — primary location for the country
  const STORE_ANCHORS: Record<string, { lat: number, lng: number, city: string, postal: string, online: boolean }> = {
    // ONLINE-ONLY (national)
    'amazon':        { lat: 0, lng: 0, city: '', postal: '', online: true },
    'amazon-ca':     { lat: 0, lng: 0, city: '', postal: '', online: true },

    // US PHYSICAL STORES — anchored in Markham/Toronto-equivalent US metro (NYC) for testing
    'walmart':       { lat: 40.7506, lng: -73.9971, city: 'New York', postal: '10001', online: false },
    'target':        { lat: 40.7400, lng: -73.9800, city: 'New York', postal: '10010', online: false },
    'best-buy':      { lat: 40.7500, lng: -73.9900, city: 'New York', postal: '10001', online: false },
    'home-depot':    { lat: 40.7300, lng: -74.0000, city: 'New York', postal: '10001', online: false },
    'nike':          { lat: 40.7660, lng: -73.9870, city: 'New York', postal: '10019', online: false },
    'kohls':         { lat: 41.8857, lng: -87.6228, city: 'Chicago',  postal: '60601', online: false },
    'macys':         { lat: 40.7506, lng: -73.9870, city: 'New York', postal: '10001', online: false },
    'gap':           { lat: 37.7793, lng: -122.4193, city: 'San Francisco', postal: '94102', online: false },

    // CANADA PHYSICAL STORES — anchored in/near Markham (your location)
    'walmart-ca':    { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
    'best-buy-ca':   { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
    'home-depot-ca': { lat: 43.8361, lng: -79.5083, city: 'Vaughan', postal: 'L4L', online: false },
    'canadian-tire': { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
    'sport-chek':    { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
    'the-bay':       { lat: 43.6580, lng: -79.3868, city: 'Toronto', postal: 'M5G', online: false },
    'loblaws':       { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
    'winners':       { lat: 43.6757, lng: -79.3839, city: 'Toronto', postal: 'M4W', online: false },
    'staples-ca':    { lat: 43.8501, lng: -79.3370, city: 'Markham', postal: 'L3R', online: false },
  }

  let updated = 0
  let online = 0
  let physical = 0
  const results: any[] = []

  for (const d of (deals || []) as any[]) {
    const slug = d.retailers?.slug
    const anchor = slug ? STORE_ANCHORS[slug] : null

    if (!anchor) {
      // No mapping — treat as online
      await supabase.from('deals').update({ is_online_only: true }).eq('id', d.id)
      online++
      continue
    }

    if (anchor.online) {
      await supabase.from('deals').update({
        is_online_only: true,
        store_latitude: null,
        store_longitude: null,
        store_city: null,
        store_postal: null,
      }).eq('id', d.id)
      online++
    } else {
      await supabase.from('deals').update({
        is_online_only: false,
        store_latitude: anchor.lat,
        store_longitude: anchor.lng,
        store_city: anchor.city,
        store_postal: anchor.postal,
      }).eq('id', d.id)
      physical++
    }
    updated++
    results.push({ id: d.id, title: d.title, slug, city: anchor.city, online: anchor.online })
  }

  // Also update retailers
  for (const [slug, anchor] of Object.entries(STORE_ANCHORS)) {
    await supabase.from('retailers').update({
      latitude: anchor.online ? null : anchor.lat,
      longitude: anchor.online ? null : anchor.lng,
      city: anchor.online ? null : anchor.city,
      postal_code: anchor.online ? null : anchor.postal,
      has_physical_stores: !anchor.online,
    }).eq('slug', slug)
  }

  return NextResponse.json({
    success: true,
    deals_processed: deals?.length || 0,
    updated, online, physical,
    sample: results.slice(0, 5),
  })
}
