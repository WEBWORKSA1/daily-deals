// Hourly cron — keeps the deals fresh.
// Runs on Netlify schedule, NOT on user request.
//
// Tasks:
//  1. Deactivate expired deals
//  2. Recompute hotness scores for active deals
//  3. Snapshot current prices into deal_price_history
//  4. Trigger AI Scout to ingest from RSS feeds
//  5. Process pending deal alert matches

import type { Config } from '@netlify/functions'

const SITE_URL = process.env.URL || 'https://daily.deals'
const CRON_SECRET = process.env.CRON_SECRET || ''

async function ping(path: string): Promise<{ ok: boolean; status: number; body?: any }> {
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': CRON_SECRET,
      },
    })
    let body
    try { body = await res.json() } catch {}
    return { ok: res.ok, status: res.status, body }
  } catch (e) {
    return { ok: false, status: 0, body: { error: String(e) } }
  }
}

export default async (req: Request) => {
  const startedAt = Date.now()
  const tasks: Array<{ name: string; result: any; ms: number }> = []

  async function run(name: string, path: string) {
    const t0 = Date.now()
    const result = await ping(path)
    tasks.push({ name, result, ms: Date.now() - t0 })
  }

  // Run all in parallel — total budget is 30s
  await Promise.all([
    run('expire-deals',     '/api/admin/expire-deals'),
    run('recompute-hotness','/api/admin/recompute-hotness'),
    run('snapshot-prices',  '/api/admin/snapshot-prices'),
    run('scout-run',        '/api/scout/run'),
    run('process-alerts',   '/api/admin/process-alerts'),
  ])

  console.log('Hourly cron complete', {
    totalMs: Date.now() - startedAt,
    tasks: tasks.map(t => ({ name: t.name, status: t.result.status, ms: t.ms })),
  })
}

export const config: Config = {
  schedule: '@hourly',
}
