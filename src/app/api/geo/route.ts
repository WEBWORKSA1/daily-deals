import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Reads Netlify's edge geolocation header (base64 JSON). Returns {} when unavailable.
export async function GET(req: NextRequest) {
  const raw = req.headers.get('x-nf-geo')
  if (!raw) return NextResponse.json({})
  try {
    const g = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
    return NextResponse.json({
      country: g?.country?.code, city: g?.city, region: g?.subdivision?.name, regionCode: g?.subdivision?.code,
      postal: g?.postal_code, lat: g?.latitude, lng: g?.longitude,
    }, { headers: { 'Cache-Control': 'private, max-age=3600' } })
  } catch { return NextResponse.json({}) }
}
