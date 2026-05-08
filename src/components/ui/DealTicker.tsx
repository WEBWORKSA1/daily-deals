'use client'
import { Deal } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function DealTicker({ deals }: { deals: Deal[] }) {
  if (!deals.length) return null

  const items = [...deals, ...deals] // duplicate for seamless loop

  return (
    <div className="bg-brand-red overflow-hidden py-2 relative">
      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((deal, i) => (
          <a
            key={i}
            href={deal.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 text-white text-xs font-bold
                       hover:text-black transition-colors flex-shrink-0"
          >
            <span className="text-white/60">•</span>
            <span className="uppercase tracking-wider">{deal.retailer_name}</span>
            <span className="text-white/80 font-normal truncate max-w-xs">{deal.title}</span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded font-black">
              -{deal.discount_percent || Math.round(((deal.original_price! - deal.deal_price) / deal.original_price!) * 100)}%
            </span>
            <span className="font-black">{formatPrice(deal.deal_price, deal.country)}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
