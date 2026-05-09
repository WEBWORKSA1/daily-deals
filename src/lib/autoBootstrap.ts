// Auto-bootstrap: ensures database is migrated, seeded, and hotness scored.
// Safe to call on every request — uses a cached flag and idempotent operations.

import { supabase } from './db'
import { runManagementSQL, MIGRATIONS } from './managementSQL'
import { allPostals } from './postalCodes'
import { STORE_ANCHORS } from './storeAnchors'
import { computeHotness } from './hotness'

let bootstrapPromise: Promise<{ ok: boolean, log: any[] }> | null = null
let bootstrapCompleted = false
let lastHotnessUpdate = 0
const HOTNESS_TTL = 15 * 60 * 1000 // 15 min

export function ensureBootstrapped(): Promise<{ ok: boolean, log: any[] }> {
  if (bootstrapCompleted) {
    // Recompute hotness if stale
    if (Date.now() - lastHotnessUpdate > HOTNESS_TTL) {
      lastHotnessUpdate = Date.now()
      recomputeHotness().catch(() => {})
    }
    return Promise.resolve({ ok: true, log: ['cached'] })
  }
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = doBootstrap()
  return bootstrapPromise
}

async function doBootstrap(): Promise<{ ok: boolean, log: any[] }> {
  const log: any[] = []

  if (!process.env.SUPABASE_PAT) {
    log.push({ step: 'skip', reason: 'no SUPABASE_PAT — running in basic mode' })
    bootstrapCompleted = true
    return { ok: true, log }
  }

  try {
    // Ensure tracking table
    const trackingMigration = MIGRATIONS.find(m => m.id === '004_create_migrations_log')
    if (trackingMigration) {
      const r = await runManagementSQL(trackingMigration.sql)
      log.push({ step: 'tracking_table', ok: r.ok, error: r.error })
      if (!r.ok) { bootstrapCompleted = true; return { ok: false, log } }
    }

    const { data: appliedRows } = await supabase.from('_dd_migrations').select('id')
    const applied = new Set((appliedRows || []).map((r: any) => r.id))

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

    // Seed postal codes
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

    // Tag retailers
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

    // Tag deals
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

    // Initial hotness computation
    const hr = await recomputeHotness()
    log.push({ step: 'compute_hotness', ...hr })

    // Auto-mark top 3 by discount as Editor's Choice (initial seed)
    try {
      const { data: topDiscounts } = await supabase
        .from('deals')
        .select('id')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('discount_percent', { ascending: false })
        .limit(3)
      if (topDiscounts && topDiscounts.length > 0) {
        const ids = topDiscounts.map((d: any) => d.id)
        await supabase
          .from('deals')
          .update({ is_editors_choice: true })
          .in('id', ids)
        log.push({ step: 'editors_choice_seed', tagged: ids.length })
      }
    } catch (e: any) {
      log.push({ step: 'editors_choice_seed', error: e?.message })
    }

    bootstrapCompleted = true
    lastHotnessUpdate = Date.now()
    return { ok: true, log }
  } catch (e: any) {
    log.push({ step: 'exception', error: e?.message || String(e) })
    bootstrapCompleted = true
    return { ok: false, log }
  }
}

// Recompute hotness scores for all active deals
async function recomputeHotness(): Promise<{ updated: number, error?: string }> {
  try {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, click_count, view_count, save_count, discount_percent, original_price, deal_price, is_featured, is_editors_choice, deal_type, expires_at, created_at')
      .eq('is_active', true)
    if (error) return { updated: 0, error: error.message }

    let updated = 0
    for (const d of (deals || []) as any[]) {
      const score = computeHotness(d)
      const { error: upErr } = await supabase
        .from('deals')
        .update({
          hotness_score: score,
          hotness_updated_at: new Date().toISOString(),
        })
        .eq('id', d.id)
      if (!upErr) updated++
    }
    return { updated }
  } catch (e: any) {
    return { updated: 0, error: e?.message || String(e) }
  }
}

export function getBootstrapStatus() {
  return {
    completed: bootstrapCompleted,
    inFlight: !!bootstrapPromise && !bootstrapCompleted,
    lastHotnessUpdate: lastHotnessUpdate ? new Date(lastHotnessUpdate).toISOString() : null,
  }
}
