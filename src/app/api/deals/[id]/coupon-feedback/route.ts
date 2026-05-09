// Deprecated alias. Use /api/coupon-feedback instead.
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(
    { error: 'deprecated', use: '/api/coupon-feedback?deal_id=<id>' },
    { status: 410 }
  )
}
export async function POST() {
  return NextResponse.json(
    { error: 'deprecated', use: 'POST /api/coupon-feedback with body { deal_id, worked }' },
    { status: 410 }
  )
}
