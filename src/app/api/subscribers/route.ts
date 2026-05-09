import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { randomBytes } from 'crypto'

function generateToken(): string {
  return randomBytes(24).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      country = 'US',
      postal_code,
      frequency = 'daily',          // 'daily' | 'weekly' | 'instant'
      categories = [],              // array of category strings
      location_city,
      location_country,
      location_postal,
    } = body

    if (!email || !email.includes('@'))
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })

    if (!['daily', 'weekly', 'instant'].includes(frequency))
      return NextResponse.json({ error: 'Frequency must be daily, weekly, or instant' }, { status: 400 })

    const cleanEmail = email.toLowerCase().trim()
    const confirmToken = generateToken()
    const unsubscribeToken = generateToken()

    // Try with all new columns first; if migration hasn't run yet, fall back to basic insert
    const fullPayload: any = {
      email: cleanEmail,
      country: country.toUpperCase(),
      postal_code: postal_code || null,
      frequency,
      preferred_categories: categories,
      confirmed: false,
      confirm_token: confirmToken,
      unsubscribe_token: unsubscribeToken,
      location_city: location_city || null,
      location_country: location_country || country.toUpperCase(),
      location_postal: location_postal || postal_code || null,
      is_active: true,
    }

    const { error: fullError } = await supabase
      .from('email_subscribers')
      .upsert(fullPayload, { onConflict: 'email' })

    if (fullError) {
      // Fall back to basic schema if columns don't exist yet
      const { error: basicError } = await supabase.from('email_subscribers').upsert({
        email: cleanEmail,
        location_city: location_city || null,
        location_country: location_country || country.toUpperCase(),
        location_postal: location_postal || postal_code || null,
        is_active: true,
      }, { onConflict: 'email' })
      if (basicError) throw basicError
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed! Check your email to confirm.',
      // Note: actual email sending requires Resend/Postmark/SendGrid integration in step 4.5
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Confirm subscription
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('confirm')
  const unsubToken = searchParams.get('unsubscribe')

  if (token) {
    const { data, error } = await supabase
      .from('email_subscribers')
      .update({ confirmed: true })
      .eq('confirm_token', token)
      .select()
      .single()
    if (error || !data) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Email confirmed!' })
  }

  if (unsubToken) {
    const { error } = await supabase
      .from('email_subscribers')
      .update({ is_active: false })
      .eq('unsubscribe_token', unsubToken)
    if (error) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Unsubscribed' })
  }

  return NextResponse.json({ error: 'No action specified' }, { status: 400 })
}
