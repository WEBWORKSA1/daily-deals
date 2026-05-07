import Link from 'next/link'
import DealCard from '@/components/deals/DealCard'
import { Deal } from '@/types'

interface Props { title: string; subtitle?: string; deals: Deal[]; viewAllHref?: string; highlight?: boolean }

export default function DealSection({ title, subtitle, deals, viewAllHref, highlight }: Props) {
  if (!deals.length) return null
  return (
    <section className={highlight ? 'bg-orange-50 -mx-4 px-4 py-8 rounded-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : ''}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
        {viewAllHref && <Link href={viewAllHref} className="text-brand-orange text-sm font-semibold hover:underline flex-shrink-0">View all →</Link>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </div>
    </section>
  )
}
