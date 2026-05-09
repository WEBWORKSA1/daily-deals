import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/deals/[id]/comments - list all comments for a deal
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'invalid_deal_id' }, { status: 400 })
  }

  const { data } = await supabase
    .from('deal_comments')
    .select(`
      id, body, parent_id, upvote_count, flag_count, is_hidden, created_at, updated_at,
      users(id, username, display_name, avatar_url, karma_score)
    `)
    .eq('deal_id', dealId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  return NextResponse.json({ comments: data || [], count: data?.length || 0 })
}

// POST /api/deals/[id]/comments - add a comment
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'invalid_deal_id' }, { status: 400 })
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'auth_required', message: 'Sign in to comment' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const text = (body.body || '').trim()
  const parentId = body.parent_id ? parseInt(body.parent_id, 10) : null

  if (!text || text.length < 2) {
    return NextResponse.json({ error: 'comment_too_short', message: 'Comment must be at least 2 characters' }, { status: 400 })
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: 'comment_too_long', message: 'Comment must be under 2000 characters' }, { status: 400 })
  }

  // Basic spam check: same user + same body in last 60s = block
  const minuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { data: dup } = await supabase
    .from('deal_comments')
    .select('id')
    .eq('user_id', user.id)
    .eq('body', text)
    .gte('created_at', minuteAgo)
    .limit(1)

  if (dup && dup.length > 0) {
    return NextResponse.json({ error: 'duplicate', message: 'Slow down — duplicate comment detected' }, { status: 429 })
  }

  const { data: comment, error } = await supabase
    .from('deal_comments')
    .insert({
      deal_id: dealId,
      user_id: user.id,
      parent_id: parentId,
      body: text,
    })
    .select(`
      id, body, parent_id, upvote_count, flag_count, created_at,
      users(id, username, display_name, avatar_url, karma_score)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Bump comment count on deal
  const { count } = await supabase
    .from('deal_comments')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId)
    .eq('is_hidden', false)

  await supabase.from('deals').update({ comment_count: count || 0 }).eq('id', dealId)

  // Karma bump for commenter
  await supabase.from('users').update({ karma_score: (user.karma_score || 0) + 1 }).eq('id', user.id)

  return NextResponse.json({ ok: true, comment })
}

// DELETE /api/deals/[id]/comments?id=N - delete own comment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  const commentId = parseInt(req.nextUrl.searchParams.get('id') || '', 10)
  if (isNaN(dealId) || isNaN(commentId)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 })
  }

  // Only owner or moderator can delete
  const { data: comment } = await supabase
    .from('deal_comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (comment.user_id !== user.id && !user.is_moderator && !user.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  await supabase.from('deal_comments').update({ is_hidden: true }).eq('id', commentId)

  // Recompute count
  const { count } = await supabase
    .from('deal_comments')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId)
    .eq('is_hidden', false)
  await supabase.from('deals').update({ comment_count: count || 0 }).eq('id', dealId)

  return NextResponse.json({ ok: true })
}
