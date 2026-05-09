// /api/admin/seed-postal-codes
//
// One-time seed: downloads the official GeoNames postal code datasets for
// US (~33,800 ZIPs) and Canada (~1,600 FSAs), parses them, and bulk-upserts
// into the postal_code_locations table.
//
// Architecture choice (analytical):
//   - We do NOT bundle the data in the app (would add ~5MB to serverless bundle)
//   - We do NOT call an external API per lookup (Zippopotam is rate-limited + slow)
//   - We DO load it once into Supabase, then query our own indexed table forever
//
// Data source: GeoNames (https://www.geonames.org/) — public domain CC-BY 4.0
//   - https://download.geonames.org/export/zip/US.zip
//   - https://download.geonames.org/export/zip/CA.zip
//
// Format: tab-separated values inside a zip with a single .txt file:
//   country | postal_code | place_name | admin_name1 | admin_code1 |
//   admin_name2 | admin_code2 | admin_name3 | admin_code3 | latitude | longitude | accuracy

import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // up to 5 minutes for the seed

interface PostalRow {
  code: string
  country: 'US' | 'CA'
  city: string
  province_state: string
  state_code: string
  latitude: number
  longitude: number
  source: 'geonames'
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  // No secret configured = dev mode = allow
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
    || req.nextUrl.searchParams.get('secret') === secret
}

// Fetch + unzip + parse a GeoNames country file.
// Returns deduplicated rows (one row per postal code — GeoNames sometimes has
// multiple rows per code for different cities; we keep the first one).
async function fetchGeoNamesCountry(country: 'US' | 'CA'): Promise<PostalRow[]> {
  const url = `https://download.geonames.org/export/zip/${country}.zip`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Daily.Deals/1.0 (postal seeder)' },
    // GeoNames is reliable but slow — give it 2 minutes
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) {
    throw new Error(`GeoNames ${country} returned ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  // The archive contains one .txt file (e.g. US.txt) plus a readme.
  const txtFile = Object.values(zip.files).find(
    (f: any) => !f.dir && f.name.toLowerCase().endsWith('.txt') && !f.name.toLowerCase().includes('readme')
  )
  if (!txtFile) {
    throw new Error(`No .txt file found in GeoNames ${country}.zip`)
  }

  const text = await (txtFile as any).async('string')
  const lines = text.split('\n')

  const seen = new Set<string>()
  const rows: PostalRow[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    if (cols.length < 11) continue

    const c = cols[0]?.trim()              // country
    const rawCode = cols[1]?.trim()        // postal_code
    const place = cols[2]?.trim()          // place_name
    const provinceName = cols[3]?.trim()   // admin_name1 (state/province)
    const provinceCode = cols[4]?.trim()   // admin_code1 (state abbr / province abbr)
    const lat = parseFloat(cols[9])
    const lng = parseFloat(cols[10])

    if (!rawCode || !place || isNaN(lat) || isNaN(lng)) continue
    if (c !== country) continue

    // For Canada, GeoNames includes full postal codes (M5V 1A1). We index by FSA only
    // (first 3 chars) to match how Daily.Deals stores them — and because Canada Post
    // doesn't license full postal-code data for free.
    const code = country === 'CA' ? rawCode.toUpperCase().substring(0, 3) : rawCode

    // Dedup: keep the first row per code (typically the most populous place)
    if (seen.has(code)) continue
    seen.add(code)

    rows.push({
      code,
      country,
      city: place,
      province_state: provinceName || '',
      state_code: provinceCode || '',
      latitude: lat,
      longitude: lng,
      source: 'geonames',
    })
  }

  return rows
}

// Bulk-upsert in batches to avoid Supabase request size limits
async function bulkUpsert(rows: PostalRow[]): Promise<{ ok: number; failed: number; errors: string[] }> {
  const BATCH = 1000
  let ok = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('postal_code_locations')
      .upsert(batch, { onConflict: 'code', ignoreDuplicates: false })
    if (error) {
      failed += batch.length
      if (errors.length < 5) errors.push(error.message)
    } else {
      ok += batch.length
    }
  }

  return { ok, failed, errors }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const startedAt = Date.now()
  const log: any = { steps: [] }

  try {
    // Fetch both countries in parallel
    log.steps.push({ step: 'download', started: new Date().toISOString() })
    const [usRows, caRows] = await Promise.all([
      fetchGeoNamesCountry('US'),
      fetchGeoNamesCountry('CA'),
    ])
    log.steps.push({
      step: 'download_done',
      us_rows: usRows.length,
      ca_rows: caRows.length,
      ms: Date.now() - startedAt,
    })

    // Upsert both
    const t1 = Date.now()
    const usResult = await bulkUpsert(usRows)
    log.steps.push({ step: 'upsert_us', ...usResult, ms: Date.now() - t1 })

    const t2 = Date.now()
    const caResult = await bulkUpsert(caRows)
    log.steps.push({ step: 'upsert_ca', ...caResult, ms: Date.now() - t2 })

    // Verify final count
    const { count: finalCount } = await supabase
      .from('postal_code_locations')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      ok: true,
      total_seeded: usResult.ok + caResult.ok,
      total_failed: usResult.failed + caResult.failed,
      final_db_count: finalCount,
      duration_seconds: Math.round((Date.now() - startedAt) / 1000),
      log,
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message || String(e),
      log,
      duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    }, { status: 500 })
  }
}

// GET = same as POST. Lets you trigger via browser address bar (with ?secret=).
export async function GET(req: NextRequest) {
  return POST(req)
}
