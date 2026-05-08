import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { runManagementSQL, MIGRATIONS } from '@/lib/managementSQL'

export const dynamic = 'force-dynamic'

// Runs all pending migrations idempotently.
// Migration #4 creates the tracking table, so we always run it first if not present.
export async function GET() {
  const log: any = { migrations: [] }

  // Step 0: ensure migrations table exists (run #4 first if missing)
  const trackingMigration = MIGRATIONS.find(m => m.id === '004_create_migrations_log')!
  const initRes = await runManagementSQL(trackingMigration.sql)
  if (!initRes.ok) {
    return NextResponse.json({
      ok: false,
      error: 'Failed to ensure migrations log table',
      detail: initRes.error,
      hint: 'Check SUPABASE_PAT env var on Netlify and that it has project access.',
    }, { status: 500 })
  }

  // Step 1: get list of already-applied migrations
  let applied: Set<string> = new Set()
  try {
    const { data } = await supabase.from('_dd_migrations').select('id')
    applied = new Set((data || []).map((r: any) => r.id))
  } catch {}

  // Step 2: run pending migrations in order
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) {
      log.migrations.push({ id: m.id, status: 'already_applied' })
      continue
    }

    const result = await runManagementSQL(m.sql)
    if (!result.ok) {
      log.migrations.push({ id: m.id, status: 'failed', error: result.error })
      log.ok = false
      log.failed_at = m.id
      return NextResponse.json(log, { status: 500 })
    }

    // Record as applied
    await supabase.from('_dd_migrations').insert({ id: m.id, name: m.name })
    log.migrations.push({ id: m.id, status: 'applied' })
  }

  log.ok = true
  log.summary = `${log.migrations.length} migrations checked`
  return NextResponse.json(log)
}
