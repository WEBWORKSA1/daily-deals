import { NextRequest, NextResponse } from 'next/server'
import { signUrl } from '@/lib/feeds/live'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Signed outbound redirect for live-layer deals. Signature prevents open-redirect abuse.
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u') || ''
  const s = req.nextUrl.searchParams.get('s') || ''
  if (!/^https:\/\//.test(u) || s !== signUrl(u)) {
    return NextResponse.redirect(new URL('/deals/hot', req.url), 302)
  }
  console.log('[go] outbound', JSON.stringify({ host: (() => { try { return new URL(u).hostname } catch { return '' } })(), ref: req.headers.get('referer') || '' }))
  const res = NextResponse.redirect(u, 302)
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  return res
}
