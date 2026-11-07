import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Verify caller has cron secret
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // if no secret configured, allow (dev mode)
  return req.headers.get('x-cron-secret') === secret
}

// POST /api/admin/expire-deals — mark expired deals inactive
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const now = new Date().toISOString()

    // Find expired deals that are still marked active
    const { data: expired, error: findErr } = await supabase
      .from('deals')
      .select('id')
      .eq('is_active', true)
      .lt('expires_at', now)
      .not('expires_at', 'is', null)

    if (findErr) throw findErr

    // Floor: never drain the curated catalogue below FLOOR active rows in one pass.
    const FLOOR = 24
    const { count: activeCount } = await supabase.from('deals').select('*', { count: 'exact', head: true }).eq('is_active', true)
    const allowed = Math.max(0, (activeCount || 0) - FLOOR)
    const ids = (expired || []).map((d: any) => d.id).sort((a: number, b: number) => a - b).slice(0, allowed)
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, expired: 0 })
    }

    const { error: updateErr } = await supabase
      .from('deals')
      .update({ is_active: false })
      .in('id', ids)

    if (updateErr) throw updateErr

    return NextResponse.json({ ok: true, expired: ids.length, ids })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req as any)
}
