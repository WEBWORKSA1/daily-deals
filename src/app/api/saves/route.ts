import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// Save a deal
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Sign in to save deals' }, { status: 401 })

  try {
    const { deal_id } = await req.json()
    if (!deal_id) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

    const { error } = await supabase
      .from('user_saved_deals')
      .upsert({ user_id: user.id, deal_id: parseInt(deal_id) }, { onConflict: 'user_id,deal_id' })
    if (error) throw error

    // Increment save_count on the deal
    await supabase.rpc('increment_save_count', { d_id: parseInt(deal_id) }).then(() => {})
      .catch(async () => {
        // Fallback if RPC doesn't exist: read-then-write
        const { data: d } = await supabase.from('deals').select('save_count').eq('id', parseInt(deal_id)).single()
        await supabase.from('deals').update({ save_count: ((d as any)?.save_count || 0) + 1 }).eq('id', parseInt(deal_id))
      })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
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
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Unsave
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get('deal_id')
  if (!dealId) return NextResponse.json({ error: 'deal_id required' }, { status: 400 })

  try {
    await supabase.from('user_saved_deals')
      .delete()
      .eq('user_id', user.id)
      .eq('deal_id', parseInt(dealId))

    // Decrement save_count
    const { data: d } = await supabase.from('deals').select('save_count').eq('id', parseInt(dealId)).single()
    const newCount = Math.max(0, ((d as any)?.save_count || 0) - 1)
    await supabase.from('deals').update({ save_count: newCount }).eq('id', parseInt(dealId))

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
