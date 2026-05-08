'use client'
import { useState, useEffect } from 'react'
import { Deal } from '@/types'
import { formatPrice, getTimeRemaining } from '@/lib/utils'

export default function DealCard({ deal }: { deal: Deal }) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    if (!deal.expires_at) return
    const tick = () => setTimeLeft(getTimeRemaining(deal.expires_at!))
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [deal.expires_at])

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

  const discount = deal.discount_percent || (deal.original_price
    ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
    : 0)
  const savings = deal.original_price ? deal.original_price - deal.deal_price : null

  return (
    <div className="deal-card card-shine group cursor-pointer" onClick={handleClick}>
      {/* IMAGE */}
      <div className="relative bg-brand-dark-4 h-44 overflow-hidden flex-shrink-0">
        {deal.image_url ? (
          <img src={deal.image_url} alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 text-5xl">🛍️</div>
        )}

        {/* DISCOUNT */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-brand-red text-white text-xs font-black
                          px-2.5 py-1 rounded-md uppercase tracking-wider shadow-glow">
            -{discount}%
          </div>
        )}

        {/* TYPE — only Flash and Clearance, no "Hot" */}
        <div className="absolute top-2 right-2">
          {deal.deal_type === 'flash'     && <span className="badge-flash">⚡ Flash</span>}
          {deal.deal_type === 'clearance' && <span className="badge-clear">Clearance</span>}
        </div>

        {/* RETAILER */}
        {deal.retailer_name && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm
                          text-white text-xs font-bold px-2 py-1 rounded-md">
            {deal.retailer_name}
          </div>
        )}

        {/* FLAG */}
        <div className="absolute bottom-2 right-2 text-base">
          {deal.country === 'CA' ? '🇨🇦' : '🇺🇸'}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-3
                       group-hover:text-brand-red transition-colors">
          {deal.title}
        </h3>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-900 text-brand-red leading-none">
              {formatPrice(deal.deal_price, deal.country)}
            </span>
            {deal.original_price && (
              <span className="text-brand-gray text-sm line-through">
                {formatPrice(deal.original_price, deal.country)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {savings && savings > 0 ? (
              <span className="text-brand-green text-xs font-bold">
                Save {formatPrice(savings, deal.country)}
              </span>
            ) : <span />}
            {deal.coupon_code && (
              <span className="text-brand-gold text-xs font-mono bg-brand-gold/10
                               border border-brand-gold/30 px-2 py-0.5 rounded tracking-wider">
                {deal.coupon_code}
              </span>
            )}
          </div>

          {timeLeft && (
            <div className="text-xs text-brand-red timer-pulse font-medium">⏱ Ends in {timeLeft}</div>
          )}

          <button disabled={clicking}
            className="w-full bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white
                       border border-brand-red/30 hover:border-brand-red
                       text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg
                       transition-all duration-150 flex items-center justify-center gap-1.5">
            {clicking ? 'Opening...' : 'Get Deal →'}
          </button>
        </div>
      </div>
    </div>
  )
}
