import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { computeHotness } from '@/lib/hotness'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
}

// POST /api/admin/recompute-hotness — recompute scores for all active deals
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    // Process in chunks of 500 to stay under 30s limit
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, click_count, view_count, save_count, discount_percent, original_price, deal_price, is_featured, is_editors_choice, deal_type, expires_at, created_at')
      .eq('is_active', true)
      .order('hotness_updated_at', { ascending: true, nullsFirst: true })
      .limit(500)

    if (error) throw error
    if (!deals || deals.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 })
    }

    // Compute new scores
    const updates = deals.map((d: any) => ({
      id: d.id,
      hotness_score: computeHotness(d),
      hotness_updated_at: new Date().toISOString(),
    }))

    // Batch update — supabase upsert with onConflict on PK
    const { error: upsertErr } = await supabase
      .from('deals')
      .upsert(updates, { onConflict: 'id' })

    if (upsertErr) throw upsertErr

    // Auto-promote: top 3 deals by hotness become editor's choice for the day
    // (unset old editor's choice from yesterday first)
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    await supabase
      .from('deals')
      .update({ is_editors_choice: false })
      .eq('is_editors_choice', true)
      .lt('hotness_updated_at', yesterday)

    const top3 = [...updates].sort((a, b) => b.hotness_score - a.hotness_score).slice(0, 3)
    if (top3.length > 0) {
      await supabase
        .from('deals')
        .update({ is_editors_choice: true })
        .in('id', top3.map(t => t.id))
    }

    return NextResponse.json({
      ok: true,
      updated: updates.length,
      promoted: top3.map(t => ({ id: t.id, score: t.hotness_score })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req as any)
}
