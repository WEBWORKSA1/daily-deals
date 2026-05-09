import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { recordPriceSnapshot } from '@/lib/priceHistory'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
}

// POST /api/admin/snapshot-prices — record current prices into deal_price_history
// for the most-recently-modified deals (so we have a price history time series)
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    // Get up to 200 most-recently-active deals to snapshot
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error
    if (!deals || deals.length === 0) {
      return NextResponse.json({ ok: true, snapshots: 0 })
    }

    // Snapshot in parallel batches of 20 to avoid hammering the DB
    const BATCH = 20
    let snapshots = 0
    for (let i = 0; i < deals.length; i += BATCH) {
      const batch = deals.slice(i, i + BATCH)
      await Promise.all(batch.map(async (d: any) => {
        await recordPriceSnapshot(d.id)
        snapshots++
      }))
    }

    return NextResponse.json({ ok: true, snapshots, scanned: deals.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req as any)
}
