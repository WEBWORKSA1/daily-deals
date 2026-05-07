import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Deal } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country  = searchParams.get('country')
  const category = searchParams.get('category')
  const retailer = searchParams.get('retailer')
  const dealType = searchParams.get('deal_type')
  const featured = searchParams.get('featured')
  const search   = searchParams.get('search')
  const national = searchParams.get('national')
  const limit    = Math.min(Number(searchParams.get('limit') || 20), 100)
  const offset   = Number(searchParams.get('offset') || 0)

  const conditions = ['d.is_active = 1', '(d.expires_at IS NULL OR d.expires_at > NOW())']
  const params: any[] = []

  if (country && country !== 'BOTH') { conditions.push("(d.country = ? OR d.country = 'BOTH')"); params.push(country) }
  if (category) { conditions.push('d.category = ?'); params.push(category) }
  if (retailer) { conditions.push('r.slug = ?'); params.push(retailer) }
  if (dealType)  { conditions.push('d.deal_type = ?'); params.push(dealType) }
  if (featured === '1') conditions.push('d.is_featured = 1')
  if (national === '1') conditions.push('d.is_national = 1')
  if (search) { conditions.push('MATCH(d.title, d.description) AGAINST(? IN BOOLEAN MODE)'); params.push(`${search}*`) }

  try {
    const deals = await query<Deal>(
      `SELECT d.*, r.name AS retailer_name, r.slug AS retailer_slug, r.brand_color AS retailer_brand_color, r.affiliate_net FROM deals d JOIN retailers r ON d.retailer_id = r.id WHERE ${conditions.join(' AND ')} ORDER BY d.is_featured DESC, d.discount_percent DESC, d.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    return NextResponse.json({ deals, count: deals.length })
  } catch (err) {
    console.error('Deals API error:', err)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}
