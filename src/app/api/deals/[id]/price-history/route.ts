// Deprecated alias. Use /api/price-history?deal_id=<id> instead.
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(
    { error: 'deprecated', use: '/api/price-history?deal_id=<id>' },
    { status: 410 }
  )
}
export async function POST() {
  return NextResponse.json(
    { error: 'deprecated', use: 'POST /api/price-history' },
    { status: 410 }
  )
}
