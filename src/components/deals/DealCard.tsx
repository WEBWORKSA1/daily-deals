'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Deal } from '@/types'
import { formatPrice, getTimeRemaining } from '@/lib/utils'
import { useLocation } from '@/hooks/useLocation'

export default function DealCard({ deal }: { deal: Deal }) {
  const { location } = useLocation()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    if (!deal.expires_at) return
    const tick = () => setTimeLeft(getTimeRemaining(deal.expires_at!))
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [deal.expires_at])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (clicking) return
    setClicking(true)
    try {
      const res = await fetch('/api/clicks', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: deal.id, user_country: location?.country || null, user_city: location?.city || null, user_postal: location?.postalCode || null }) })
      const data = await res.json()
      window.open(data.url || deal.affiliate_url, '_blank', 'noopener,noreferrer')
    } catch { window.open(deal.affiliate_url, '_blank', 'noopener,noreferrer') }
    setClicking(false)
  }

  const savings = deal.original_price ? deal.original_price - deal.deal_price : null

  return (
    <div className="deal-card group flex flex-col h-full">
      <Link href={`/deal/${deal.id}`} className="block relative">
        <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: (deal.retailer_brand_color || '#0A1628') + '15' }}>
          {deal.image_url ? <img src={deal.image_url} alt={deal.title} className="h-full w-full object-contain p-4" loading="lazy" /> : <span className="opacity-30 text-6xl">🏷️</span>}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {deal.deal_type === 'flash'     && <span className="badge-flash">⚡ FLASH</span>}
            {deal.deal_type === 'clearance' && <span className="badge-clearance">CLEARANCE</span>}
            {deal.discount_percent && deal.discount_percent >= 50 && <span className="badge-discount">🔥 {deal.discount_percent}% OFF</span>}
          </div>
          <div className="absolute top-2 right-2 text-lg">{deal.country === 'CA' ? '🇨🇦' : deal.country === 'US' ? '🇺🇸' : '🌎'}</div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: (deal.retailer_brand_color || '#0A1628') + '20', color: deal.retailer_brand_color || '#0A1628' }}>{deal.retailer_name}</span>
          {deal.category && <span className="text-xs text-gray-400">{deal.category}</span>}
        </div>
        <Link href={`/deal/${deal.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-orange transition-colors mb-3">{deal.title}</h3>
        </Link>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl font-bold text-brand-navy">{formatPrice(deal.deal_price, deal.country)}</span>
          {deal.original_price && <span className="text-sm text-gray-400 line-through">{formatPrice(deal.original_price, deal.country)}</span>}
        </div>
        <div className="flex items-center gap-2 mb-3">
          {deal.discount_percent && <span className="text-xs font-bold text-green-600">-{deal.discount_percent}% OFF</span>}
          {savings && savings > 0 && <span className="text-xs text-green-600">Save {formatPrice(savings, deal.country)}</span>}
        </div>
        {deal.coupon_code && (
          <div className="flex items-center gap-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-yellow-700">Code:</span>
            <code className="text-xs font-bold text-yellow-800 tracking-wider">{deal.coupon_code}</code>
          </div>
        )}
        {timeLeft && <div className="mb-3 timer-flash"><span className="text-xs text-red-500 font-medium">⏱ Expires in {timeLeft}</span></div>}
        <button onClick={handleClick} disabled={clicking} className="mt-auto w-full btn-primary justify-center text-sm">{clicking ? 'Loading...' : 'Get Deal →'}</button>
      </div>
    </div>
  )
}
