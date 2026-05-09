'use client'
import { useState } from 'react'
import { Deal } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function FeaturedDeal({ deal }: { deal: Deal }) {
  const [clicking, setClicking] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const discount = deal.discount_percent || (deal.original_price
    ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
    : 0)
  const savings = deal.original_price ? deal.original_price - deal.deal_price : null
  const showPlaceholder = !deal.image_url || imgFailed

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
    <div className="bg-white border border-ink overflow-hidden cursor-pointer group" onClick={handleClick}>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-0">

        {/* IMAGE — with high-contrast placeholder when broken */}
        <div className="relative bg-paper-2 h-64 md:h-[420px] overflow-hidden border-b md:border-b-0 md:border-r border-rule">
          {showPlaceholder ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(10,10,10,0.03) 14px, rgba(10,10,10,0.03) 15px)',
                 }}>
              <div className="font-serif font-medium text-ink text-3xl tracking-tight">
                Daily<span className="text-accent">.</span>Deals
              </div>
              <div className="text-ink-muted text-xs tracking-[0.2em]">
                {deal.retailer_name ? deal.retailer_name.toUpperCase() : 'IMAGE UNAVAILABLE'}
              </div>
            </div>
          ) : (
            <img
              src={deal.image_url!}
              alt={deal.title}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          )}

          {discount > 0 && (
            <div className="absolute top-4 left-4 badge-discount text-base">
              -{discount}%
            </div>
          )}
          {deal.deal_type === 'flash' && (
            <div className="absolute top-4 right-4 text-[11px] tracking-wider px-2 py-1 bg-accent text-white">
              DAILY FLASH
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-7 lg:p-10 flex flex-col justify-center">
          <div className="badge-eyebrow mb-3">
            {deal.retailer_name?.toUpperCase() || 'RETAILER'} · {deal.country === 'CA' ? 'CANADA' : 'UNITED STATES'}
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-medium text-ink leading-[1.1] mb-4">
            {deal.title}
          </h2>

          {deal.description && (
            <p className="text-ink-2 text-sm leading-relaxed mb-6 line-clamp-3">
              {deal.description}
            </p>
          )}

          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-5xl font-medium text-accent tabular-nums leading-none">
              {formatPrice(deal.deal_price, deal.country)}
            </span>
            {deal.original_price && (
              <span className="font-mono text-xl text-ink-muted line-through tabular-nums">
                {formatPrice(deal.original_price, deal.country)}
              </span>
            )}
          </div>

          {savings && savings > 0 && (
            <p className="text-good text-sm font-medium mb-6">
              Save {formatPrice(savings, deal.country)} — {discount}% off
            </p>
          )}

          {deal.coupon_code && (
            <div className="flex items-center gap-2 mb-6 border border-rule px-3 py-2 w-fit">
              <span className="text-[11px] tracking-wider text-ink-muted">CODE</span>
              <code className="text-ink font-mono font-medium tracking-widest">{deal.coupon_code}</code>
            </div>
          )}

          <button disabled={clicking}
            className="btn-primary text-base px-8 py-4 w-full md:w-auto justify-center">
            {clicking ? 'Opening…' : 'Get this deal →'}
          </button>

          <p className="text-ink-muted text-[11px] mt-3 tracking-wider">
            AT {deal.retailer_name?.toUpperCase()} · AFFILIATE LINK
          </p>
        </div>
      </div>
    </div>
  )
}
