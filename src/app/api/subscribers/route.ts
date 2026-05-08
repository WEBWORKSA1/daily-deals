import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, location_city, location_country, location_postal } = await req.json()
    if (!email || !email.includes('@'))
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })

    const { error } = await supabase.from('email_subscribers').upsert({
      email: email.toLowerCase().trim(),
      location_city,
      location_country,
      location_postal,
      is_active: true
    }, { onConflict: 'email' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
