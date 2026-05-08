import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = (searchParams.get('code') || '').toUpperCase().replace(/\s/g, '')
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  // For Canadian postal codes, take first 3 chars (FSA)
  const isCanadian = /^[A-Z]\d[A-Z]/.test(code)
  const lookupCode = isCanadian ? code.substring(0, 3) : code

  const { data, error } = await supabase
    .from('postal_code_locations')
    .select('*')
    .eq('code', lookupCode)
    .single()

  if (error || !data) {
    return NextResponse.json({
      found: false,
      code: lookupCode,
      message: 'Postal/ZIP not in our database yet. Showing nearest national deals.'
    })
  }

  return NextResponse.json({
    found: true,
    code: lookupCode,
    country: data.country,
    city: data.city,
    province_state: data.province_state,
    state_code: data.state_code,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
  })
}
