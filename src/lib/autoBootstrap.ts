// Auto-bootstrap: ensures database is migrated, seeded, hotness scored, and price history seeded.
// Safe to call on every request — uses a cached flag and idempotent operations.
//
// NEW IN THIS VERSION:
//   - Self-healing scrape: if the deals table is empty AND ANTHROPIC_API_KEY is set,
//     fire the scrape+curate pipeline in the background on cold start. Runs once per
//     server-instance lifetime, so a homepage hit on a freshly-deployed Netlify
//     instance auto-populates real deals without anyone clicking a button.

import { supabase } from './db'
import { runManagementSQL, MIGRATIONS } from './managementSQL'
import { allPostals } from './postalCodes'
import { STORE_ANCHORS } from './storeAnchors'
import { computeHotness } from './hotness'

let bootstrapPromise: Promise<{ ok: boolean, log: any[] }> | null = null
let bootstrapCompleted = false
let lastHotnessUpdate = 0
let pipelineFired = false  // Per-instance flag — fires once on first cold start
const HOTNESS_TTL = 15 * 60 * 1000 // 15 min

export function ensureBootstrapped(): Promise<{ ok: boolean, log: any[] }> {
  if (bootstrapCompleted) {
    if (Date.now() - lastHotnessUpdate > HOTNESS_TTL) {
      lastHotnessUpdate = Date.now()
      recomputeHotness().catch(() => {})
    }
    // Self-healing: if deals are empty and we haven't fired yet this instance, kick it off
    if (!pipelineFired) {
      pipelineFired = true
      maybeFirePipeline().catch(() => {})
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
        code: p.code, country: p.country, city: p.city,
        province_state: p.province_state, state_code: p.state_code,
        latitude: p.latitude, longitude: p.longitude, source: 'seeded',
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
          is_online_only: true, store_latitude: null, store_longitude: null,
          store_city: null, store_postal: null,
        }).eq('id', d.id)
        online++
      } else {
        await supabase.from('deals').update({
          is_online_only: false, store_latitude: anchor.lat, store_longitude: anchor.lng,
          store_city: anchor.city, store_postal: anchor.postal,
        }).eq('id', d.id)
        physical++
      }
    }
    log.push({ step: 'tag_deals', total: deals?.length || 0, online, physical })

    // Hotness
    const hr = await recomputeHotness()
    log.push({ step: 'compute_hotness', ...hr })

    // Editor's Choice seed
    try {
      const { data: topDiscounts } = await supabase
        .from('deals').select('id').eq('is_active', true).eq('is_featured', true)
        .order('discount_percent', { ascending: false }).limit(3)
      if (topDiscounts && topDiscounts.length > 0) {
        const ids = topDiscounts.map((d: any) => d.id)
        await supabase.from('deals').update({ is_editors_choice: true }).in('id', ids)
        log.push({ step: 'editors_choice_seed', tagged: ids.length })
      }
    } catch (e: any) {
      log.push({ step: 'editors_choice_seed', error: e?.message })
    }

    // Initial price history snapshot for all active deals (only if none exist)
    try {
      const { count: snapCount } = await supabase
        .from('deal_price_history')
        .select('*', { count: 'exact', head: true })

      if ((snapCount || 0) === 0) {
        const { data: allDeals } = await supabase
          .from('deals')
          .select('id, deal_price, original_price, discount_percent')
          .eq('is_active', true)

        const rows = (allDeals || []).map((d: any) => ({
          deal_id: d.id,
          price: d.deal_price,
          original_price: d.original_price,
          discount_percent: d.discount_percent,
        }))
        if (rows.length > 0) {
          await supabase.from('deal_price_history').insert(rows)
          for (const d of (allDeals || []) as any[]) {
            await supabase.from('deals').update({
              lowest_price_ever: d.deal_price,
              highest_price_ever: d.deal_price,
              avg_price_30d: d.deal_price,
              price_trend: 'stable',
            }).eq('id', d.id)
          }
          log.push({ step: 'seed_price_history', snapshots: rows.length })
        }
      } else {
        log.push({ step: 'seed_price_history', skipped: true, existing: snapCount })
      }
    } catch (e: any) {
      log.push({ step: 'seed_price_history', error: e?.message })
    }

    bootstrapCompleted = true
    lastHotnessUpdate = Date.now()

    // Final step: self-healing pipeline kick (background, fire-and-forget)
    if (!pipelineFired) {
      pipelineFired = true
      maybeFirePipeline().catch(() => {})
    }

    return { ok: true, log }
  } catch (e: any) {
    log.push({ step: 'exception', error: e?.message || String(e) })
    bootstrapCompleted = true
    return { ok: false, log }
  }
}

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
        .update({ hotness_score: score, hotness_updated_at: new Date().toISOString() })
        .eq('id', d.id)
      if (!upErr) updated++
    }
    return { updated }
  } catch (e: any) {
    return { updated: 0, error: e?.message || String(e) }
  }
}

// Self-healing pipeline kicker. Runs once per Netlify-instance cold start.
// Fires the scrape+curate pipeline IF:
//   1. ANTHROPIC_API_KEY is configured (otherwise curator can't run)
//   2. The deals table has fewer than 5 active rows (i.e. site is empty/near-empty)
// This means the first homepage hit after a fresh deploy auto-populates real deals
// in the background — no admin login, no button click, no waiting for the cron.
async function maybeFirePipeline(): Promise<void> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return

    const { count: activeDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if ((activeDeals || 0) >= 5) {
      console.log('[autoBootstrap] skip pipeline kick: site already has', activeDeals, 'active deals')
      return
    }

    const siteUrl = process.env.URL
      || process.env.NEXT_PUBLIC_SITE_URL
      || 'https://daily.deals'
    const cronSecret = process.env.CRON_SECRET || ''

    console.log('[autoBootstrap] firing scrape pipeline at', siteUrl)

    // Fire scrape, then curate. Do not await on the homepage handler.
    fetch(`${siteUrl}/api/scrape/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': cronSecret,
      },
      signal: AbortSignal.timeout(290_000),
    })
      .then(r => r.json())
      .then(scrapeJson => {
        console.log('[autoBootstrap] scrape complete:', JSON.stringify({
          total_scraped: scrapeJson?.total_scraped,
          total_inserted: scrapeJson?.total_inserted,
          duration: scrapeJson?.duration_seconds,
        }))
        return fetch(`${siteUrl}/api/curator/run?limit=200`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Cron-Secret': cronSecret,
          },
          signal: AbortSignal.timeout(290_000),
        })
      })
      .then(r => r?.json())
      .then(curateJson => {
        console.log('[autoBootstrap] curate complete:', JSON.stringify({
          judged: curateJson?.judged,
          published: curateJson?.published,
          rejected: curateJson?.rejected,
          errors: curateJson?.errors,
        }))
      })
      .catch(e => {
        console.error('[autoBootstrap] pipeline error:', e?.message || String(e))
      })
  } catch (e: any) {
    console.error('[autoBootstrap] maybeFirePipeline error:', e?.message)
  }
}

export function getBootstrapStatus() {
  return {
    completed: bootstrapCompleted,
    inFlight: !!bootstrapPromise && !bootstrapCompleted,
    pipelineFired,
    lastHotnessUpdate: lastHotnessUpdate ? new Date(lastHotnessUpdate).toISOString() : null,
  }
}
