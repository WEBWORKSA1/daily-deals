import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Bump save_count via RPC, falling back to read-then-write if RPC missing.
async function bumpSaveCount(dealId: number, delta: number) {
  if (delta > 0) {
    try {
      const res: any = await supabase.rpc('increment_save_count', { d_id: dealId })
      if (!res?.error) return
    } catch {}
  }
  // Fallback / decrement path
  try {
    const { data: d } = await supabase
      .from('deals')
      .select('save_count')
      .eq('id', dealId)
      .single()
    const current = (d as any)?.save_count || 0
    const next = Math.max(0, current + delta)
    await supabase.from('deals').update({ save_count: next }).eq('id', dealId)
  } catch {}
}

// Save a deal
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Sign in to save deals' }, { status: 401 })

  try {
    const { deal_id } = await req.json()
    const dealId = parseInt(deal_id, 10)
    if (!dealId || isNaN(dealId)) {
      return NextResponse.json({ error: 'deal_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_saved_deals')
      .upsert({ user_id: user.id, deal_id: dealId }, { onConflict: 'user_id,deal_id' })
    if (error) throw error

    await bumpSaveCount(dealId, 1)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

// Get user's saved deals
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ saves: [] })

  try {
    const { data } = await supabase
      .from('user_saved_deals')
      .select(`
        id, created_at,
        deals(*, retailers(name, slug, brand_color, affiliate_net))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const saves = (data || []).map((s: any) => ({
      saved_at: s.created_at,
      ...s.deals,
      retailer_name: s.deals?.retailers?.name,
      retailer_slug: s.deals?.retailers?.slug,
      retailer_brand_color: s.deals?.retailers?.brand_color,
      affiliate_net: s.deals?.retailers?.affiliate_net,
    }))
    return NextResponse.json({ saves })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

// Unsave
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dealIdStr = searchParams.get('deal_id')
  const dealId = parseInt(dealIdStr || '', 10)
  if (!dealId || isNaN(dealId)) {
    return NextResponse.json({ error: 'deal_id required' }, { status: 400 })
  }

  try {
    await supabase
      .from('user_saved_deals')
      .delete()
      .eq('user_id', user.id)
      .eq('deal_id', dealId)

    await bumpSaveCount(dealId, -1)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
