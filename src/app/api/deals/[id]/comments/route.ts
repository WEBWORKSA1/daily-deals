// Deprecated alias. Use /api/comments?deal_id=N instead.
// This file exists to avoid 404s if any client cached the old path.
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(
    { error: 'deprecated', use: '/api/comments?deal_id=<id>' },
    { status: 410 }
  )
}
export async function POST() {
  return NextResponse.json(
    { error: 'deprecated', use: 'POST /api/comments with body { deal_id, body }' },
    { status: 410 }
  )
}
