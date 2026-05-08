import Link from 'next/link'
import DealCard from '@/components/deals/DealCard'
import { Deal } from '@/types'

interface Props {
  title: string
  subtitle?: string
  deals: Deal[]
  viewAllHref?: string
  highlight?: boolean
}

export default function DealSection({ title, subtitle, deals, viewAllHref, highlight }: Props) {
  if (!deals.length) return null

  return (
    <section className={highlight
      ? 'bg-brand-gold/5 border border-brand-gold/15 rounded-2xl p-6'
      : ''}>

      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full ${highlight ? 'bg-brand-gold' : 'bg-brand-red'}`} />
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-900 text-white uppercase tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-brand-gray text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref}
            className="text-brand-gray-2 hover:text-brand-red text-xs font-bold
                       uppercase tracking-wider transition-colors flex items-center gap-1
                       border border-white/10 hover:border-brand-red/30 px-3 py-1.5 rounded-lg">
            View All →
          </Link>
        )}
      </div>

      {/* DEAL GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  )
}
