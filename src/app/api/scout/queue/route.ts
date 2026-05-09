// Scout queue: list, approve, reject pending scout-discovered deals

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET: list pending deals (is_active = false from scout)
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color)')
    .eq('is_active', false)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, count: (data || []).length, deals: data || [] })
}

// POST: approve a pending deal (set is_active = true)
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { deal_id, action } = await request.json()
  if (!deal_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'deal_id + action(approve|reject) required' }, { status: 400 })
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from('deals')
      .update({ is_active: true })
      .eq('id', deal_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'approved', deal_id })
  } else {
    const { error } = await supabase.from('deals').delete().eq('id', deal_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'rejected', deal_id })
  }
}
