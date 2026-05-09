import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Post a new comment
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 })

  try {
    const { deal_id, body, parent_id } = await req.json()
    if (!deal_id || !body || body.trim().length === 0)
      return NextResponse.json({ error: 'deal_id and body required' }, { status: 400 })
    if (body.length > 2000)
      return NextResponse.json({ error: 'Comment too long (max 2000)' }, { status: 400 })

    const { data, error } = await supabase
      .from('deal_comments')
      .insert({
        deal_id: parseInt(deal_id),
        user_id: user.id,
        parent_id: parent_id ? parseInt(parent_id) : null,
        body: body.trim(),
      })
      .select('*, users(username, display_name, karma_score)')
      .single()
    if (error) throw error

    // Bump comment_count on deal
    const { data: deal } = await supabase.from('deals').select('comment_count').eq('id', parseInt(deal_id)).single()
    await supabase.from('deals').update({ comment_count: ((deal as any)?.comment_count || 0) + 1 }).eq('id', parseInt(deal_id))

    return NextResponse.json({ success: true, comment: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Get comments for a deal
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get('deal_id')
  if (!dealId) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

  try {
    const { data } = await supabase
      .from('deal_comments')
      .select('id, deal_id, parent_id, body, upvote_count, created_at, users(username, display_name, karma_score)')
      .eq('deal_id', parseInt(dealId))
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ comments: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Delete own comment
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    // Only allow deleting own comment (or moderator)
    const { data: c } = await supabase.from('deal_comments').select('user_id, deal_id').eq('id', parseInt(id)).single()
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if ((c as any).user_id !== user.id && !user.is_moderator && !user.is_admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await supabase.from('deal_comments').update({ is_hidden: true }).eq('id', parseInt(id))

    // Decrement count
    const dealId = (c as any).deal_id
    const { data: deal } = await supabase.from('deals').select('comment_count').eq('id', dealId).single()
    await supabase.from('deals').update({ comment_count: Math.max(0, ((deal as any)?.comment_count || 0) - 1) }).eq('id', dealId)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
