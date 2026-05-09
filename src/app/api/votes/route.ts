import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// Cast / change vote
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Sign in to vote' }, { status: 401 })

  try {
    const { deal_id, vote } = await req.json()
    if (!deal_id || ![1, -1, 0].includes(vote))
      return NextResponse.json({ error: 'vote must be 1 (up), -1 (down), or 0 (remove)' }, { status: 400 })

    const dealId = parseInt(deal_id)

    // Get existing vote (if any)
    const { data: existing } = await supabase
      .from('user_votes')
      .select('id, vote')
      .eq('user_id', user.id)
      .eq('deal_id', dealId)
      .single()

    if (vote === 0) {
      // Remove vote
      if (existing) {
        await supabase.from('user_votes').delete().eq('id', existing.id)
        await adjustVoteCount(dealId, -existing.vote)
      }
    } else if (existing) {
      // Change vote
      if (existing.vote !== vote) {
        await supabase.from('user_votes').update({ vote }).eq('id', existing.id)
        await adjustVoteCount(dealId, vote - existing.vote)
      }
    } else {
      // New vote
      await supabase.from('user_votes').insert({ user_id: user.id, deal_id: dealId, vote })
      await adjustVoteCount(dealId, vote)
    }

    // Return new totals
    const { data: deal } = await supabase
      .from('deals')
      .select('upvote_count, downvote_count')
      .eq('id', dealId)
      .single()

    return NextResponse.json({
      success: true,
      upvotes: (deal as any)?.upvote_count || 0,
      downvotes: (deal as any)?.downvote_count || 0,
      user_vote: vote === 0 ? null : vote,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Get user's votes (for highlighting in UI)
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ votes: {} })

  try {
    const { data } = await supabase
      .from('user_votes')
      .select('deal_id, vote')
      .eq('user_id', user.id)

    const votes: Record<number, number> = {}
    for (const v of (data || []) as any[]) votes[v.deal_id] = v.vote

    return NextResponse.json({ votes })
  } catch {
    return NextResponse.json({ votes: {} })
  }
}

async function adjustVoteCount(dealId: number, delta: number) {
  if (delta === 0) return
  try {
    const { data: d } = await supabase.from('deals').select('upvote_count, downvote_count').eq('id', dealId).single()
    if (!d) return

    let upvote_count = (d as any).upvote_count || 0
    let downvote_count = (d as any).downvote_count || 0

    // Delta logic:
    //   +1: new upvote
    //   -1: new downvote
    //   +2: switching from down→up (rm 1 down, add 1 up)
    //   -2: switching from up→down
    if (delta === 1) upvote_count++
    if (delta === -1) downvote_count++
    if (delta === 2) { upvote_count++; downvote_count = Math.max(0, downvote_count - 1) }
    if (delta === -2) { downvote_count++; upvote_count = Math.max(0, upvote_count - 1) }

    await supabase
      .from('deals')
      .update({ upvote_count, downvote_count })
      .eq('id', dealId)
  } catch {}
}
