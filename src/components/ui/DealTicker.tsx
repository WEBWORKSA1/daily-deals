import { Deal } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function DealTicker({ deals }: { deals: Deal[] }) {
  const list = deals.filter(d => d.deal_price !== null)
  if (!list.length) return null
  const items = [...list, ...list] // duplicate for a seamless loop
  return (
    <div className="bg-accent overflow-hidden py-2 relative" aria-label="Deal ticker">
      <div className="flex animate-ticker whitespace-nowrap hover:[animation-play-state:paused]">
        {items.map((deal, i) => {
          const pct = deal.discount_percent || (deal.original_price ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100) : 0)
          const href = deal.is_live ? deal.out_url! : `/deal/${deal.id}`
          return (
            <a key={i} href={href} target={deal.is_live ? '_blank' : undefined} rel={deal.is_live ? 'noopener sponsored' : undefined}
              className="inline-flex items-center gap-2 px-6 text-white text-xs font-medium hover:underline flex-shrink-0">
              <span className="uppercase tracking-wider opacity-80">{deal.retailer_name}</span>
              <span className="font-normal truncate max-w-xs">{deal.title}</span>
              {pct > 0 && <span className="bg-white/20 px-2 py-0.5 rounded">-{pct}%</span>}
              <span className="font-mono">{formatPrice(deal.deal_price, deal.country)}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
