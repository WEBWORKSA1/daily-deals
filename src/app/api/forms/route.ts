import { NextRequest, NextResponse } from 'next/server'
import { handleSubmission, sanitize, validate, FormType } from '@/lib/server/forms'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Soft in-memory rate limit per warm instance: 8 submissions / 10 min / IP.
const hits = new Map<string, number[]>()
function limited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter(t => now - t < 600_000)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > 8
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 }) }

  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const formType = String(body?.form_type || '') as FormType
  const raw = body?.fields || {}

  // Honeypot + time-trap: bots fill hidden fields and submit instantly. Pretend success.
  if (raw.company_website || (raw._t && Date.now() - Number(raw._t) < 1500)) {
    return NextResponse.json({ ok: true })
  }
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'Too many submissions — please try again in a few minutes.' }, { status: 429 })

  const fields = sanitize(raw)
  const err = validate(formType, fields)
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 })

  const result = await handleSubmission({
    form_type: formType,
    fields,
    source_path: String(body?.path || '').slice(0, 300),
    referrer: req.headers.get('referer') || undefined,
    ip,
    user_agent: req.headers.get('user-agent') || undefined,
  })

  if (!result.ok) return NextResponse.json({ ok: false, error: 'We could not record your message. Please try again shortly.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
