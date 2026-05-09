// Auto-generates a 1200x630 Open Graph share image for each deal.
// Used by:
//   - <meta property="og:image">
//   - <meta name="twitter:image">
//   - Pinterest pin generation
//   - Reddit/Facebook share previews

import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/db'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const dealId = parseInt(params.id, 10)
  if (isNaN(dealId)) {
    return new Response('Invalid deal id', { status: 400 })
  }

  const { data: deal } = await supabase
    .from('deals')
    .select('title, deal_price, original_price, discount_percent, image_url, country, retailers(name)')
    .eq('id', dealId)
    .single()

  if (!deal) {
    return new Response('Deal not found', { status: 404 })
  }

  const d: any = deal
  const currency = d.country === 'CA' ? 'CAD' : 'USD'
  const symbol = '$'
  const dealPrice = `${symbol}${Number(d.deal_price).toFixed(0)}`
  const origPrice = d.original_price ? `${symbol}${Number(d.original_price).toFixed(0)}` : null
  const discount = d.discount_percent || (d.original_price
    ? Math.round(((d.original_price - d.deal_price) / d.original_price) * 100)
    : 0)
  const retailerName = d.retailers?.name || 'Daily.Deals'
  const titleClipped = (d.title || '').slice(0, 80)

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0A0A',
        backgroundImage: 'linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 100%)',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}>
        {/* Top bar with brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px 48px',
          borderBottom: '2px solid rgba(220, 38, 38, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              backgroundColor: '#dc2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 900, color: '#fff',
            }}>D</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
                Daily.Deals
              </span>
              <span style={{ fontSize: 14, color: '#888', letterSpacing: 2, textTransform: 'uppercase' }}>
                Every day
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {d.country === 'CA' ? (
              <span style={{ fontSize: 24 }}>🇨🇦</span>
            ) : (
              <span style={{ fontSize: 24 }}>🇺🇸</span>
            )}
            <span style={{ fontSize: 16, color: '#aaa' }}>{retailerName}</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          flex: 1,
          padding: '48px',
          alignItems: 'center',
          gap: 48,
        }}>
          {/* Image */}
          {d.image_url ? (
            <div style={{
              display: 'flex',
              width: 380, height: 380,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: '#fff',
              flexShrink: 0,
            }}>
              <img src={d.image_url} alt="" width={380} height={380}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{
              width: 380, height: 380,
              borderRadius: 24,
              backgroundColor: '#1f1f1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 120,
              flexShrink: 0,
            }}>🛍️</div>
          )}

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
            {discount > 0 && (
              <div style={{
                display: 'flex',
                alignSelf: 'flex-start',
                backgroundColor: '#dc2626',
                color: '#fff',
                fontSize: 56,
                fontWeight: 900,
                padding: '8px 24px',
                borderRadius: 12,
                letterSpacing: -2,
              }}>
                -{discount}% OFF
              </div>
            )}

            <div style={{
              fontSize: 38,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: -1,
            }}>
              {titleClipped}{(d.title || '').length > 80 ? '…' : ''}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8 }}>
              <span style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#dc2626',
                letterSpacing: -2,
                lineHeight: 1,
              }}>
                {dealPrice}
              </span>
              {origPrice && (
                <span style={{
                  fontSize: 32,
                  color: '#666',
                  textDecoration: 'line-through',
                }}>
                  {origPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          backgroundColor: '#dc2626',
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            🔥 Get this deal at daily.deals
          </span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Updated daily
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
