// Scrape + curate cron — runs every 6 hours (00:00, 06:00, 12:00, 18:00 UTC).
//
// We dropped from "daily at 5:00 UTC" to "every 6 hours" so:
//   1. Worst-case wait between content drops is 6 hours instead of 24
//   2. Self-healing kicks in faster if the morning run fails
//   3. The site feels more alive than a once-per-day refresh
//
// Pipeline:
//   1. POST /api/scrape/run         — hit all 15 retailer scrapers
//   2. POST /api/curator/run        — Claude Haiku judges each one
//   3. Log results to Netlify function logs

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
  console.log('Scrape + curate cron starting at', new Date().toISOString())

  const scrapeResult = await ping('/api/scrape/run')
  console.log('Scrape result:', JSON.stringify(scrapeResult.body || scrapeResult, null, 2))

  const curateResult = await ping('/api/curator/run?limit=200')
  console.log('Curate result:', JSON.stringify(curateResult.body || curateResult, null, 2))

  console.log('Scrape cron complete in', Math.round((Date.now() - startedAt) / 1000), 'sec')
}

export const config: Config = {
  // Every 6 hours: 00:00, 06:00, 12:00, 18:00 UTC.
  // Includes 04:00 EST (~midnight Eastern) every day plus three other refreshes.
  schedule: '0 */6 * * *',
}
