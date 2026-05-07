import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Retailer } from '@/types'

export async function GET(req: NextRequest) {
  const country = new URL(req.url).searchParams.get('country')
  const params: any[] = []
  let where = 'WHERE r.is_active = 1'
  if (country) { where += " AND (r.country = ? OR r.country = 'BOTH')"; params.push(country) }
  try {
    const retailers = await query<Retailer & { deal_count: number }>(
      `SELECT r.*, COUNT(d.id) AS deal_count FROM retailers r LEFT JOIN deals d ON d.retailer_id = r.id AND d.is_active = 1 AND (d.expires_at IS NULL OR d.expires_at > NOW()) ${where} GROUP BY r.id ORDER BY deal_count DESC`,
      params
    )
    return NextResponse.json({ retailers })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
