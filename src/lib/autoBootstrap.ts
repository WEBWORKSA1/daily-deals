// Auto-bootstrap: ensures database is migrated and seeded on first cold start.
// Safe to call on every request — uses a cached flag and idempotent operations.

import { supabase } from './db'
import { runManagementSQL, MIGRATIONS } from './managementSQL'
import { allPostals } from './postalCodes'
import { STORE_ANCHORS } from './storeAnchors'

let bootstrapPromise: Promise<{ ok: boolean, log: any[] }> | null = null
let bootstrapCompleted = false

export function ensureBootstrapped(): Promise<{ ok: boolean, log: any[] }> {
  if (bootstrapCompleted) return Promise.resolve({ ok: true, log: ['cached'] })
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = doBootstrap()
  return bootstrapPromise
}

async function doBootstrap(): Promise<{ ok: boolean, log: any[] }> {
  const log: any[] = []

  // Skip entirely if no PAT — still let site work with anon key
  if (!process.env.SUPABASE_PAT) {
    log.push({ step: 'skip', reason: 'no SUPABASE_PAT — running in basic mode' })
    bootstrapCompleted = true
    return { ok: true, log }
  }

  try {
    // Step 1: Ensure migrations tracking table exists
    const trackingMigration = MIGRATIONS.find(m => m.id === '004_create_migrations_log')
    if (trackingMigration) {
      const r = await runManagementSQL(trackingMigration.sql)
      log.push({ step: 'tracking_table', ok: r.ok, error: r.error })
      if (!r.ok) { bootstrapCompleted = true; return { ok: false, log } }
    }

    // Step 2: Get applied migrations
    const { data: appliedRows } = await supabase.from('_dd_migrations').select('id')
    const applied = new Set((appliedRows || []).map((r: any) => r.id))

    // Step 3: Run pending migrations
    for (const m of MIGRATIONS) {
      if (applied.has(m.id)) continue
      const r = await runManagementSQL(m.sql)
      if (!r.ok) {
        log.push({ step: m.id, ok: false, error: r.error })
        bootstrapCompleted = true
        return { ok: false, log }
      }
      await supabase.from('_dd_migrations').insert({ id: m.id, name: m.name })
      log.push({ step: m.id, ok: true })
    }

    // Step 4: Seed postal codes (only if table is empty)
    const { count: postalCount } = await supabase
      .from('postal_code_locations')
      .select('*', { count: 'exact', head: true })

    if ((postalCount || 0) < 50) {
      const rows = allPostals().map(p => ({
        code: p.code,
        country: p.country,
        city: p.city,
        province_state: p.province_state,
        state_code: p.state_code,
        latitude: p.latitude,
        longitude: p.longitude,
        source: 'seeded',
      }))
      const { error } = await supabase
        .from('postal_code_locations')
        .upsert(rows, { onConflict: 'code', ignoreDuplicates: true })
      log.push({ step: 'seed_postals', ok: !error, count: rows.length, error: error?.message })
    } else {
      log.push({ step: 'seed_postals', ok: true, skipped: true, existing: postalCount })
    }

    // Step 5: Geo-tag retailers (only those without geo set)
    let retailersTagged = 0
    for (const [slug, anchor] of Object.entries(STORE_ANCHORS)) {
      const payload: any = {
        latitude: anchor.online ? null : anchor.lat,
        longitude: anchor.online ? null : anchor.lng,
        city: anchor.online ? null : anchor.city,
        postal_code: anchor.online ? null : anchor.postal,
        has_physical_stores: !anchor.online,
      }
      const { error } = await supabase.from('retailers').update(payload).eq('slug', slug)
      if (!error) retailersTagged++
    }
    log.push({ step: 'tag_retailers', tagged: retailersTagged })

    // Step 6: Geo-tag deals
    const { data: deals } = await supabase
      .from('deals')
      .select('id, retailers(slug)')
      .eq('is_active', true)
    let online = 0, physical = 0
    for (const d of (deals || []) as any[]) {
      const slug = d.retailers?.slug
      const anchor = slug ? STORE_ANCHORS[slug] : null
      if (!anchor || anchor.online) {
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
    }
    log.push({ step: 'tag_deals', total: deals?.length || 0, online, physical })

    bootstrapCompleted = true
    return { ok: true, log }
  } catch (e: any) {
    log.push({ step: 'exception', error: e?.message || String(e) })
    bootstrapCompleted = true
    return { ok: false, log }
  }
}

export function getBootstrapStatus() {
  return { completed: bootstrapCompleted, inFlight: !!bootstrapPromise && !bootstrapCompleted }
}
