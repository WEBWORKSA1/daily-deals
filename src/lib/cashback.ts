// Cashback engine — when a logged-in user clicks an affiliate link,
// we track it. When the retailer reports a confirmed sale (manual import for now),
// we credit the user's wallet.

import { supabase } from './db'

// Generate a deterministic click ID for affiliate URL tagging
export function generateClickId(userId: number, dealId: number): string {
  const timestamp = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 8)
  return `dd-${userId}-${dealId}-${timestamp}-${rnd}`
}

// Record a click and create a pending cashback event
export async function recordCashbackClick(opts: {
  userId: number
  dealId: number
  retailerId: number
  cashbackRate: number
}): Promise<{ click_id: string }> {
  const click_id = generateClickId(opts.userId, opts.dealId)

  await supabase.from('cashback_events').insert({
    user_id: opts.userId,
    deal_id: opts.dealId,
    retailer_id: opts.retailerId,
    click_id,
    status: 'pending',
    cashback_rate: opts.cashbackRate,
  })

  return { click_id }
}

// Confirm a cashback event when retailer reports the sale
export async function confirmCashback(opts: {
  click_id: string
  confirmed_purchase_amount: number
}): Promise<{ ok: boolean, cashback_amount?: number, error?: string }> {
  // Find the event
  const { data: event, error: findErr } = await supabase
    .from('cashback_events')
    .select('*')
    .eq('click_id', opts.click_id)
    .single()

  if (findErr || !event) return { ok: false, error: 'click_id not found' }
  if (event.status !== 'pending') return { ok: false, error: `already ${event.status}` }

  const cashback_amount = (opts.confirmed_purchase_amount * event.cashback_rate) / 100

  // Update the event
  await supabase
    .from('cashback_events')
    .update({
      status: 'confirmed',
      confirmed_purchase_amount: opts.confirmed_purchase_amount,
      cashback_amount,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', event.id)

  // Update or create user balance
  const { data: existing } = await supabase
    .from('user_cashback_balance')
    .select('*')
    .eq('user_id', event.user_id)
    .single()

  if (existing) {
    await supabase
      .from('user_cashback_balance')
      .update({
        pending_amount: Number(existing.pending_amount) + cashback_amount,
        lifetime_earned: Number(existing.lifetime_earned) + cashback_amount,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', event.user_id)
  } else {
    await supabase.from('user_cashback_balance').insert({
      user_id: event.user_id,
      pending_amount: cashback_amount,
      available_amount: 0,
      lifetime_earned: cashback_amount,
      lifetime_paid: 0,
    })
  }

  return { ok: true, cashback_amount }
}

// Get user's cashback summary
export async function getUserCashback(userId: number) {
  const { data: balance } = await supabase
    .from('user_cashback_balance')
    .select('*')
    .eq('user_id', userId)
    .single()

  const { data: recentEvents } = await supabase
    .from('cashback_events')
    .select('*, retailers(name, slug, brand_color), deals(title, image_url)')
    .eq('user_id', userId)
    .order('clicked_at', { ascending: false })
    .limit(20)

  return {
    balance: balance || {
      pending_amount: 0,
      available_amount: 0,
      lifetime_earned: 0,
      lifetime_paid: 0,
    },
    events: recentEvents || [],
  }
}
