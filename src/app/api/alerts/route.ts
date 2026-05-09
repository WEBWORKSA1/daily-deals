import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Create a deal alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      keyword,
      retailer_slug,
      category,
      min_discount = 30,
      max_price,
    } = body

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
    if (!keyword && !retailer_slug && !category)
      return NextResponse.json({ error: 'Must specify keyword, retailer, or category' }, { status: 400 })

    // Find or create subscriber
    const cleanEmail = email.toLowerCase().trim()
    let subscriberId: number | null = null

    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id')
      .eq('email', cleanEmail)
      .single()

    if (existing) {
      subscriberId = existing.id
    } else {
      const { data: created, error: createErr } = await supabase
        .from('email_subscribers')
        .insert({ email: cleanEmail, is_active: true })
        .select('id')
        .single()
      if (createErr) throw createErr
      subscriberId = created.id
    }

    // Create alert
    const { data, error } = await supabase
      .from('deal_alerts')
      .insert({
        subscriber_id: subscriberId,
        keyword: keyword || null,
        retailer_slug: retailer_slug || null,
        category: category || null,
        min_discount,
        max_price: max_price || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, alert: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// List alerts for an email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  try {
    const { data: sub } = await supabase
      .from('email_subscribers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!sub) return NextResponse.json({ alerts: [] })

    const { data: alerts } = await supabase
      .from('deal_alerts')
      .select('*')
      .eq('subscriber_id', sub.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({ alerts: alerts || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Delete an alert
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const email = searchParams.get('email')
  if (!id || !email) return NextResponse.json({ error: 'id and email required' }, { status: 400 })

  try {
    const { data: sub } = await supabase
      .from('email_subscribers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { error } = await supabase
      .from('deal_alerts')
      .update({ is_active: false })
      .eq('id', parseInt(id))
      .eq('subscriber_id', sub.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
