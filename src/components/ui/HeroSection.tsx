'use client'
import { useLocation } from '@/hooks/useLocation'
import Link from 'next/link'
import { Deal } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  totalDeals: number
  spotlightDeal?: Deal | null
}

export default function HeroSection({ totalDeals, spotlightDeal }: Props) {
  const { location, loading } = useLocation()
  const [imgFailed, setImgFailed] = useState(false)

  const showSpotlight = !!spotlightDeal
  const showSpotlightImage = spotlightDeal?.image_url && !imgFailed

  const discount = spotlightDeal
    ? (spotlightDeal.discount_percent || (spotlightDeal.original_price
        ? Math.round(((spotlightDeal.original_price - spotlightDeal.deal_price) / spotlightDeal.original_price) * 100)
        : 0))
    : 0

  return (
    <section className="relative bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className={`grid grid-cols-1 ${showSpotlight ? 'lg:grid-cols-[1.1fr_1fr]' : ''} gap-10 lg:gap-14 items-start`}>

          {/* LEFT — EDITORIAL HEADLINE */}
          <div>
            <div className="section-eyebrow mb-4">
              {loading ? 'DETECTING LOCATION…' : location
                ? `EDITION FOR ${location.city.toUpperCase()}, ${location.stateCode}`
                : 'NORTH AMERICAN EDITION'}
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-[-0.025em] text-ink mb-5">
              Daily Deals.<br />
              <span className="text-accent">Every Day.</span>
            </h1>

            <p className="text-ink-2 text-base lg:text-lg leading-relaxed max-w-xl mb-7">
              Hand-picked discounts from 1,000+ retailers across the US and Canada. Verified by editors. Updated every 24 hours. Always free.
            </p>

            {/* STATS ROW */}
            <div className="grid grid-cols-3 gap-6 py-5 border-t border-b border-rule mb-7 max-w-lg">
              <div>
                <div className="font-mono text-2xl font-medium text-ink tabular-nums leading-none">
                  {totalDeals > 0 ? totalDeals.toLocaleString() : '—'}
                </div>
                <div className="text-[10px] tracking-[0.15em] text-ink-muted mt-1.5">LIVE TODAY</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-medium text-ink tabular-nums leading-none">43,140</div>
                <div className="text-[10px] tracking-[0.15em] text-ink-muted mt-1.5">ZIPS COVERED</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-medium text-ink tabular-nums leading-none">1,000+</div>
                <div className="text-[10px] tracking-[0.15em] text-ink-muted mt-1.5">RETAILERS</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/deals/hot" className="btn-primary">
                Browse all deals →
              </Link>
              <Link href="/deals/flash" className="btn-outline">
                Daily Flash Deals
              </Link>
            </div>
          </div>

          {/* RIGHT — REAL FEATURED DAILY DEAL CARD (only renders if we have a real deal) */}
          {showSpotlight && spotlightDeal && (
            <Link href={`/deal/${spotlightDeal.id}`} className="bg-white border border-ink p-6 lg:p-7 block hover:border-accent transition-colors group">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" aria-hidden />
                <span className="text-[11px] tracking-[0.2em] text-accent font-medium">FEATURED DAILY DEAL</span>
              </div>

              {/* IMAGE OR HIGH-CONTRAST PLACEHOLDER */}
              <div className="bg-paper-2 border border-rule h-44 sm:h-56 mb-5 overflow-hidden relative">
                {showSpotlightImage ? (
                  <img
                    src={spotlightDeal.image_url!}
                    alt={spotlightDeal.title}
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <ImagePlaceholder retailerName={spotlightDeal.retailer_name} large />
                )}
              </div>

              <div className="badge-eyebrow mb-2">
                {(spotlightDeal.category || 'DEAL').toUpperCase()} · {(spotlightDeal.retailer_name || 'RETAILER').toUpperCase()}
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-medium leading-tight text-ink mb-4 line-clamp-2 group-hover:text-accent transition-colors">
                {spotlightDeal.title}
              </h2>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-mono text-3xl font-medium text-accent tabular-nums leading-none">
                  {formatPrice(spotlightDeal.deal_price, spotlightDeal.country)}
                </span>
                {spotlightDeal.original_price && (
                  <span className="font-mono text-base text-ink-muted line-through tabular-nums">
                    {formatPrice(spotlightDeal.original_price, spotlightDeal.country)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge-discount">-{discount}%</span>
                )}
              </div>

              <div className="btn-primary w-full justify-center">
                See this deal →
              </div>
            </Link>
          )}

        </div>
      </div>
    </section>
  )
}

// HIGH-CONTRAST IMAGE PLACEHOLDER
// The previous version was so faint (text-ink-muted on bg-paper-2) it looked like
// a blank white box. This version uses pattern + bold mono wordmark + dark border.
function ImagePlaceholder({ retailerName, large = false }: { retailerName?: string; large?: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 relative"
         style={{
           backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(10,10,10,0.025) 12px, rgba(10,10,10,0.025) 13px)',
         }}>
      <div className={`font-serif font-medium text-ink ${large ? 'text-2xl' : 'text-base'} tracking-tight`}>
        Daily<span className="text-accent">.</span>Deals
      </div>
      <div className={`text-ink-muted ${large ? 'text-[11px]' : 'text-[10px]'} tracking-[0.2em]`}>
        {retailerName ? retailerName.toUpperCase() : 'IMAGE UNAVAILABLE'}
      </div>
    </div>
  )
}
