import { NextResponse } from 'next/server'
import { lookupPostal } from '@/lib/postalCodes'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code') || ''
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  const record = lookupPostal(code)
  if (!record) {
    return NextResponse.json({
      found: false,
      code: code.toUpperCase(),
      message: 'Postal/ZIP not in our database yet. Showing top national deals.'
    })
  }

  return NextResponse.json({
    found: true,
    code: record.code,
    country: record.country,
    city: record.city,
    province_state: record.province_state,
    state_code: record.state_code,
    latitude: record.latitude,
    longitude: record.longitude,
  })
}
