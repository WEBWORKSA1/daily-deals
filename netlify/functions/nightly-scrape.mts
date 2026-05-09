// Nightly scrape + curate cron — runs at 5:00 UTC = 00:00 EST = midnight Eastern.
//
// Pipeline:
//   1. POST /api/scrape/run         — hit all 15 retailer scrapers
//   2. Wait briefly for raw deals to settle
//   3. POST /api/curator/run        — Claude Haiku judges each one
//   4. Log results
//
// This replaces the placeholder "AI Scout" RSS approach for daily ingestion.
// The hourly cron still runs for incremental tasks (hotness, expiry, alerts).

import type { Config } from '@netlify/functions'

const SITE_URL = process.env.URL || 'https://daily.deals'
const CRON_SECRET = process.env.CRON_SECRET || ''

async function ping(path: string, timeoutMs = 290_000): Promise<{ ok: boolean; status: number; body?: any }> {
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': CRON_SECRET,
      },
      signal: AbortSignal.timeout(timeoutMs),
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
  console.log('Nightly scrape + curate starting at', new Date().toISOString())

  // 1. Scrape all retailers
  const scrapeResult = await ping('/api/scrape/run')
  console.log('Scrape result:', JSON.stringify(scrapeResult.body || scrapeResult, null, 2))

  // 2. Curate the queue (process up to 200 at a time per cron run)
  const curateResult = await ping('/api/curator/run?limit=200')
  console.log('Curate result:', JSON.stringify(curateResult.body || curateResult, null, 2))

  console.log('Nightly cron complete in', Math.round((Date.now() - startedAt) / 1000), 'sec')
}

export const config: Config = {
  // 5:00 UTC = 00:00 EST (during EST/winter) = 01:00 EDT (summer)
  // Close enough to "midnight Eastern" year-round.
  schedule: '0 5 * * *',
}
