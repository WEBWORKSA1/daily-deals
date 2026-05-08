'use client'
import { useState } from 'react'
import { Deal } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function FeaturedDeal({ deal }: { deal: Deal }) {
  const [clicking, setClicking] = useState(false)

  const discount = deal.discount_percent || (deal.original_price
    ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
    : 0)
  const savings = deal.original_price ? deal.original_price - deal.deal_price : null

  async function handleClick() {
    if (clicking) return
    setClicking(true)
    try {
      await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: deal.id })
      })
    } catch {}
    window.open(deal.affiliate_url, '_blank', 'noopener,noreferrer')
    setClicking(false)
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-brand-dark-3 border border-brand-red/20
                    hover:border-brand-red/50 transition-all duration-300 group cursor-pointer"
         onClick={handleClick}>

      {/* BG GLOW */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(232,34,42,0.08), transparent 70%)' }} />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">

        {/* IMAGE SIDE */}
        <div className="relative bg-brand-dark-4 h-64 md:h-80 overflow-hidden">
          {deal.image_url ? (
            <img src={deal.image_url} alt={deal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">🛍️</div>
          )}
          {/* DISCOUNT OVERLAY */}
          <div className="absolute top-4 left-4">
            <div className="bg-brand-red text-white text-2xl font-black px-4 py-2 rounded-xl shadow-glow">
              -{discount}%
            </div>
          </div>
          {/* RETAILER */}
          {deal.retailer_name && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm
                            text-white text-sm font-bold px-3 py-1.5 rounded-lg">
              {deal.retailer_name} {deal.country === 'CA' ? '🇨🇦' : '🇺🇸'}
            </div>
          )}
        </div>

        {/* CONTENT SIDE */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-hot">🔥 Deal of the Day</span>
            {deal.deal_type === 'flash' && <span className="badge-flash">⚡ Flash</span>}
          </div>

          <h2 className="font-heading text-3xl md:text-4xl font-900 text-white leading-tight mb-4 uppercase
                         group-hover:text-brand-red transition-colors">
            {deal.title}
          </h2>

          {deal.description && (
            <p className="text-brand-gray text-sm leading-relaxed mb-6 line-clamp-2">
              {deal.description}
            </p>
          )}

          {/* PRICE */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-heading text-5xl font-900 text-brand-red leading-none">
              {formatPrice(deal.deal_price, deal.country)}
            </span>
            {deal.original_price && (
              <span className="text-brand-gray text-xl line-through">
                {formatPrice(deal.original_price, deal.country)}
              </span>
            )}
          </div>

          {savings && savings > 0 && (
            <p className="text-brand-green font-bold text-sm mb-6">
              You save {formatPrice(savings, deal.country)} ({discount}% off)
            </p>
          )}

          {/* COUPON */}
          {deal.coupon_code && (
            <div className="flex items-center gap-2 mb-6 bg-brand-gold/10 border border-brand-gold/30
                            rounded-lg px-4 py-2 w-fit">
              <span className="text-brand-gold text-xs font-bold uppercase">Coupon:</span>
              <code className="text-brand-gold font-mono font-black tracking-widest">{deal.coupon_code}</code>
            </div>
          )}

          {/* CTA */}
          <button disabled={clicking}
            className="btn-primary text-base px-8 py-4 w-full md:w-auto justify-center">
            {clicking ? 'Opening...' : `Get This Deal →`}
          </button>

          <p className="text-brand-gray text-xs mt-3">
            At {deal.retailer_name} — affiliate link, no extra cost to you
          </p>
        </div>
      </div>
    </div>
  )
}
