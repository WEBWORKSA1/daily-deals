import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { lookupPostal as lookupHardcoded } from '@/lib/postalCodes'

export const dynamic = 'force-dynamic'

interface PostalResult {
  found: boolean
  code: string
  country?: 'US' | 'CA'
  city?: string
  province_state?: string
  state_code?: string
  latitude?: number
  longitude?: number
  source?: 'cache' | 'seeded' | 'fallback' | 'hardcoded'
  message?: string
}

// Fire-and-forget helper that swallows errors.
async function silently<T>(p: PromiseLike<T>): Promise<void> {
  try { await p } catch {}
}

// Normalize input: uppercase, strip whitespace, take FSA for Canada
function normalizeCode(input: string): { clean: string, country: 'US' | 'CA' | null } {
  const clean = input.toUpperCase().replace(/\s/g, '')
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(clean)) return { clean: clean.substring(0, 3), country: 'CA' }
  if (/^[A-Z]\d[A-Z]$/.test(clean)) return { clean, country: 'CA' }
  if (/^\d{5}$/.test(clean)) return { clean, country: 'US' }
  return { clean, country: null }
}

// Try Supabase cache first
async function tryCache(code: string): Promise<PostalResult | null> {
  try {
    const { data, error } = await supabase
      .from('postal_code_locations')
      .select('*')
      .eq('code', code)
      .single()
    if (error || !data) return null
    return {
      found: true,
      code: data.code,
      country: data.country,
      city: data.city,
      province_state: data.province_state,
      state_code: data.state_code,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      source: data.source === 'fallback' ? 'cache' : 'seeded',
    }
  } catch { return null }
}

// Zippopotam fallback API
async function tryZippopotam(code: string, country: 'US' | 'CA'): Promise<PostalResult | null> {
  try {
    const cc = country === 'CA' ? 'ca' : 'us'
    const res = await fetch(`https://api.zippopotam.us/${cc}/${code}`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return null
    const data = await res.json()
    const place = data.places?.[0]
    if (!place) return null

    const lat = parseFloat(place.latitude)
    const lng = parseFloat(place.longitude)

    const result: PostalResult = {
      found: true,
      code,
      country,
      city: place['place name'],
      province_state: place['state'],
      state_code: place['state abbreviation'],
      latitude: lat,
      longitude: lng,
      source: 'fallback',
    }

    // Auto-cache to Supabase for next time (fire-and-forget, errors swallowed)
    silently(supabase.from('postal_code_locations').upsert({
      code,
      country,
      city: result.city,
      province_state: result.province_state,
      state_code: result.state_code,
      latitude: lat,
      longitude: lng,
      source: 'fallback',
    }, { onConflict: 'code' }))

    return result
  } catch { return null }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('code') || ''
  if (!input) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  const { clean, country } = normalizeCode(input)
  if (!country) {
    return NextResponse.json({
      found: false,
      code: clean,
      message: 'Enter a 5-digit US ZIP (e.g. 10001) or Canadian postal code (e.g. M5V 1A1)'
    })
  }

  // Layer 1: Supabase cache (fastest)
  const cached = await tryCache(clean)
  if (cached) return NextResponse.json(cached)

  // Layer 2: Hardcoded library (works even if Supabase migration hasn't run yet)
  const hardcoded = lookupHardcoded(clean)
  if (hardcoded) {
    // Try to write to cache for next time (fire-and-forget)
    silently(supabase.from('postal_code_locations').upsert({
      code: hardcoded.code,
      country: hardcoded.country,
      city: hardcoded.city,
      province_state: hardcoded.province_state,
      state_code: hardcoded.state_code,
      latitude: hardcoded.latitude,
      longitude: hardcoded.longitude,
      source: 'seeded',
    }, { onConflict: 'code' }))

    return NextResponse.json({
      found: true,
      code: hardcoded.code,
      country: hardcoded.country,
      city: hardcoded.city,
      province_state: hardcoded.province_state,
      state_code: hardcoded.state_code,
      latitude: hardcoded.latitude,
      longitude: hardcoded.longitude,
      source: 'hardcoded',
    })
  }

  // Layer 3: External API fallback (Zippopotam)
  const fallback = await tryZippopotam(clean, country)
  if (fallback) return NextResponse.json(fallback)

  // All layers failed
  return NextResponse.json({
    found: false,
    code: clean,
    message: `Could not find ${clean}. Try a major city ZIP/postal code.`
  })
}
