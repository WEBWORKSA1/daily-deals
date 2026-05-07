import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, location_city, location_country, location_postal } = await req.json()
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    await query(
      `INSERT INTO email_subscribers (email, location_city, location_country, location_postal) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_active = 1`,
      [email.toLowerCase().trim(), location_city || null, location_country || null, location_postal || null]
    )
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
