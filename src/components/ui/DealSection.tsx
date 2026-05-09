import Link from 'next/link'
import DealCard from '@/components/deals/DealCard'
import { Deal } from '@/types'

interface Props {
  title: string
  subtitle?: string
  deals: Deal[]
  viewAllHref?: string
  highlight?: boolean
  sectionNumber?: string  // "01", "02", "LOCAL"
}

export default function DealSection({ title, subtitle, deals, viewAllHref, highlight, sectionNumber }: Props) {
  if (!deals.length) return null

  return (
    <section className={highlight ? 'bg-paper-2 border-y border-rule -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10' : ''}>
      {/* EDITORIAL SECTION HEADER */}
      <div className="flex items-baseline justify-between mb-2">
        {sectionNumber && (
          <div className="section-eyebrow">SECTION {sectionNumber}</div>
        )}
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs text-ink hover:text-accent border-b border-ink hover:border-accent pb-px transition-colors">
            See all →
          </Link>
        )}
      </div>

      <h2 className="section-h2 mb-1">{title}</h2>
      {subtitle && <p className="section-sub mb-7">{subtitle}</p>}
      {!subtitle && <div className="mb-7" />}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  )
}
