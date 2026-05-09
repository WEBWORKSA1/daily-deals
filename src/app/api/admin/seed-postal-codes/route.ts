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
export const maxDuration = 300

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
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
    || req.nextUrl.searchParams.get('secret') === secret
}

// Clean a place name from GeoNames.
// Some Canadian entries look like:  "Saint John (Lower West, Greendale, ...)"
// or "Toronto (St. James Town / Cabbagetown / Regent Park)"
// We want the canonical city name only: "Saint John" / "Toronto".
function cleanPlaceName(raw: string): string {
  if (!raw) return ''
  let s = raw.trim()
  // Strip parentheticals
  const parenIdx = s.indexOf('(')
  if (parenIdx > 0) s = s.substring(0, parenIdx).trim()
  // Strip everything after a slash (multi-neighbourhood listings)
  const slashIdx = s.indexOf('/')
  if (slashIdx > 0) s = s.substring(0, slashIdx).trim()
  // Strip everything after first comma (sometimes "City, Region, Other")
  const commaIdx = s.indexOf(',')
  if (commaIdx > 0) s = s.substring(0, commaIdx).trim()
  return s.substring(0, 80) // hard cap regardless
}

function safeTruncate(s: string, max: number): string {
  if (!s) return ''
  return s.length > max ? s.substring(0, max) : s
}

async function fetchGeoNamesCountry(country: 'US' | 'CA'): Promise<PostalRow[]> {
  const url = `https://download.geonames.org/export/zip/${country}.zip`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Daily.Deals/1.0 (postal seeder)' },
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) throw new Error(`GeoNames ${country} returned ${res.status}`)

  const arrayBuffer = await res.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const txtFile = Object.values(zip.files).find(
    (f: any) => !f.dir && f.name.toLowerCase().endsWith('.txt') && !f.name.toLowerCase().includes('readme')
  )
  if (!txtFile) throw new Error(`No .txt file in GeoNames ${country}.zip`)

  const text = await (txtFile as any).async('string')
  const lines = text.split('\n')

  const seen = new Set<string>()
  const rows: PostalRow[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    if (cols.length < 11) continue

    const c = cols[0]?.trim()
    const rawCode = cols[1]?.trim()
    const placeRaw = cols[2]?.trim()
    const provinceRaw = cols[3]?.trim()
    const provinceCode = cols[4]?.trim()
    const lat = parseFloat(cols[9])
    const lng = parseFloat(cols[10])

    if (!rawCode || !placeRaw || isNaN(lat) || isNaN(lng)) continue
    if (c !== country) continue

    // Canada: index by FSA (first 3 chars of "M5V 1A1")
    const code = country === 'CA' ? rawCode.toUpperCase().substring(0, 3) : rawCode
    if (seen.has(code)) continue
    seen.add(code)

    rows.push({
      code: safeTruncate(code, 10),
      country,
      city: cleanPlaceName(placeRaw),                  // <= 80 chars, parens/slashes stripped
      province_state: safeTruncate(provinceRaw || '', 80),
      state_code: safeTruncate(provinceCode || '', 10),
      latitude: lat,
      longitude: lng,
      source: 'geonames',
    })
  }

  return rows
}

// Bulk-upsert with smaller batches and per-batch error reporting.
// Smaller batches mean fewer rows lost when a single row is bad.
async function bulkUpsert(rows: PostalRow[]): Promise<{
  ok: number; failed: number; errors: string[]; failed_samples: any[]
}> {
  const BATCH = 250
  let ok = 0
  let failed = 0
  const errors: string[] = []
  const failed_samples: any[] = []

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('postal_code_locations')
      .upsert(batch, { onConflict: 'code', ignoreDuplicates: false })

    if (error) {
      failed += batch.length
      if (errors.length < 5) errors.push(error.message)
      // Log up to 3 sample rows from failed batches so we can debug
      if (failed_samples.length < 3) {
        failed_samples.push({
          first_row: batch[0],
          batch_index: i,
          error: error.message,
        })
      }
    } else {
      ok += batch.length
    }
  }

  return { ok, failed, errors, failed_samples }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const startedAt = Date.now()
  const log: any = { steps: [] }

  try {
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

    const t1 = Date.now()
    const usResult = await bulkUpsert(usRows)
    log.steps.push({ step: 'upsert_us', ...usResult, ms: Date.now() - t1 })

    const t2 = Date.now()
    const caResult = await bulkUpsert(caRows)
    log.steps.push({ step: 'upsert_ca', ...caResult, ms: Date.now() - t2 })

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

export async function GET(req: NextRequest) {
  return POST(req)
}
