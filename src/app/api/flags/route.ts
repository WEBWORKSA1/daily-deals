import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Submit a flag/report
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)

  try {
    const { target_type, target_id, reason, details } = await req.json()
    if (!['deal', 'comment'].includes(target_type))
      return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
    if (!target_id) return NextResponse.json({ error: 'target_id required' }, { status: 400 })
    if (!reason) return NextResponse.json({ error: 'reason required' }, { status: 400 })

    // Insert flag (anyone can flag, even anonymous)
    await supabase.from('flags').insert({
      flagged_by_user_id: user?.id || null,
      target_type,
      target_id: parseInt(target_id),
      reason,
      details: details || null,
    })

    // Increment flag_count on target
    if (target_type === 'deal') {
      const { data: d } = await supabase.from('deals').select('flag_count').eq('id', parseInt(target_id)).single()
      const newCount = ((d as any)?.flag_count || 0) + 1
      await supabase.from('deals').update({ flag_count: newCount }).eq('id', parseInt(target_id))
      // Auto-hide if 5+ flags
      if (newCount >= 5) {
        await supabase.from('deals').update({ is_active: false }).eq('id', parseInt(target_id))
      }
    } else if (target_type === 'comment') {
      const { data: c } = await supabase.from('deal_comments').select('flag_count').eq('id', parseInt(target_id)).single()
      const newCount = ((c as any)?.flag_count || 0) + 1
      await supabase.from('deal_comments').update({ flag_count: newCount }).eq('id', parseInt(target_id))
      if (newCount >= 3) {
        await supabase.from('deal_comments').update({ is_hidden: true }).eq('id', parseInt(target_id))
      }
    }

    return NextResponse.json({ success: true, message: 'Thanks for reporting. Our moderators will review.' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// List unresolved flags (mod/admin only)
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user || (!user.is_admin && !user.is_moderator))
    return NextResponse.json({ error: 'Mod access required' }, { status: 403 })

  try {
    const { data } = await supabase
      .from('flags')
      .select('*, flagged_by:users!flagged_by_user_id(username)')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ flags: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
