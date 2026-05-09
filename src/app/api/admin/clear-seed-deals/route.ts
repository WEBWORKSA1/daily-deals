// /api/admin/clear-seed-deals
//
// One-time cleanup: removes all currently-seeded placeholder deals so the homepage
// starts empty before real scraped deals begin populating. Safe to re-run — idempotent.
//
// Auth: CRON_SECRET via header or query.

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
    || req.nextUrl.searchParams.get('secret') === secret
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Mark every existing deal inactive. Don't delete — the price_history,
  // votes, comments tables have foreign keys we want to preserve historically.
  // The inactive flag hides them from all homepage queries.
  const { count: beforeCount } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { error } = await supabase
    .from('deals')
    .update({ is_active: false, is_editors_choice: false, is_featured: false })
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    deactivated: beforeCount || 0,
    message: 'Seed deals deactivated. Homepage will show empty state until scrapers populate live deals.',
  })
}

export async function GET(req: NextRequest) { return POST(req) }
