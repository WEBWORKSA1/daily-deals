// This route was a duplicate of /api/comments?deal_id=N — kept as alias for backwards-compat.
// Forwards GET/POST/DELETE to the canonical handler.
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealId = params.id
  const url = new URL(req.url)
  const target = `${url.origin}/api/comments?deal_id=${dealId}`
  const r = await fetch(target, { headers: req.headers })
  return new NextResponse(r.body, { status: r.status, headers: r.headers })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const url = new URL(req.url)
  const target = `${url.origin}/api/comments`
  const r = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
    body: JSON.stringify({ ...body, deal_id: parseInt(params.id) }),
  })
  return new NextResponse(r.body, { status: r.status, headers: r.headers })
}
