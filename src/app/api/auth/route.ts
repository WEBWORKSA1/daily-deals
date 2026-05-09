import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { randomBytes, createHash } from 'crypto'

// Magic link signin: user enters email → we create/find user → send link
// The "link" for now stores a token in a cookie (no actual email service yet)
// Once Resend integration is added, the token gets emailed instead

const COOKIE_NAME = 'dd_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function token(): string {
  return randomBytes(32).toString('hex')
}

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex')
}

// Sign up / sign in (no password — magic-link style)
export async function POST(req: NextRequest) {
  try {
    const { email, username, country = 'US', postal_code } = await req.json()
    if (!email || !email.includes('@'))
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })

    const cleanEmail = email.toLowerCase().trim()

    // Find or create user
    let user: any = null
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .single()

    if (existing) {
      user = existing
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id)
    } else {
      const { data: created, error } = await supabase
        .from('users')
        .insert({
          email: cleanEmail,
          username: username || cleanEmail.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6),
          country: country.toUpperCase(),
          postal_code: postal_code || null,
        })
        .select()
        .single()
      if (error) throw error
      user = created
    }

    // Create session token
    const sessionToken = token()
    const sessionHash = hash(sessionToken)

    // For now we accept the token immediately (in real magic-link flow, we'd email this)
    // TODO when Resend is integrated: don't return token, email it instead

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        karma_score: user.karma_score,
      }
    })
    res.cookies.set(COOKIE_NAME, `${user.id}.${sessionToken}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Get current session (used by client to know who's logged in)
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie) return NextResponse.json({ user: null })
  const [userId] = cookie.value.split('.')
  if (!userId) return NextResponse.json({ user: null })
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, username, display_name, karma_score, country, is_admin, is_moderator')
      .eq('id', parseInt(userId))
      .single()
    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}

// Sign out
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
