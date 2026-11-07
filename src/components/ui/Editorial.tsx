import Link from 'next/link'
import type { Deal } from '@/types'
import DealCard from '@/components/deals/DealCard'
import { AMAZON_US_TAG, AMAZON_CA_TAG } from '@/lib/site'

export function SectionHead({ n, eyebrow, title, sub, href, hrefLabel = 'View all' }: { n?: string; eyebrow: string; title: string; sub?: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <div className="section-eyebrow mb-2">{n ? `SECTION ${n} · ` : ''}{eyebrow}</div>
        <h2 className="section-h2 mb-1">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="text-xs text-ink hover:text-accent border-b border-ink hover:border-accent pb-px whitespace-nowrap">
          {hrefLabel} →
        </Link>
      )}
    </div>
  )
}

export function PageHero({ eyebrow, title, dek, children }: { eyebrow: string; title: React.ReactNode; dek?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="border-b border-rule bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="section-eyebrow mb-3">{eyebrow}</div>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-ink leading-[1.05] max-w-4xl">{title}</h1>
        {dek && <p className="text-ink-2 text-base lg:text-lg leading-relaxed max-w-2xl mt-4">{dek}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}

export function DealGrid({ deals, empty, ranked }: { deals: Deal[]; empty?: React.ReactNode; ranked?: boolean }) {
  if (!deals.length) return <>{empty ?? <EmptyDeals />}</>
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {deals.map((d, i) => (
        <div key={d.id} className="relative">
          {ranked && i < 10 && (
            <div className="absolute -top-2 -left-2 z-10 w-7 h-7 bg-ink text-white text-[11px] font-mono flex items-center justify-center">{i + 1}</div>
          )}
          <DealCard deal={d} />
        </div>
      ))}
    </div>
  )
}

export function EmptyDeals() {
  return (
    <div className="border border-rule p-10 text-center">
      <div className="section-eyebrow mb-2">REFRESHING</div>
      <h3 className="font-serif text-2xl text-ink mb-2">Our deal desk is pulling fresh offers.</h3>
      <p className="text-ink-2 text-sm max-w-md mx-auto mb-5">Sources refresh every 30 minutes. In the meantime, the official retailer deal pages below are updated daily.</p>
      <Link href="/concierge" className="btn-primary">Have us find it for you →</Link>
    </div>
  )
}

const amz = (host: string, path: string, tag: string) => `https://${host}${path}${path.includes('?') ? '&' : '?'}tag=${tag}`

export const DEAL_HUBS: Array<{ name: string; label: string; href: string; country: 'US' | 'CA' }> = [
  { name: 'Amazon', label: 'Today’s Deals', href: amz('www.amazon.com', '/deals', AMAZON_US_TAG), country: 'US' },
  { name: 'Amazon.ca', label: 'Today’s Deals', href: amz('www.amazon.ca', '/deals', AMAZON_CA_TAG), country: 'CA' },
  { name: 'Walmart', label: 'Deals & Rollbacks', href: 'https://www.walmart.com/shop/deals', country: 'US' },
  { name: 'Best Buy', label: 'Top Deals', href: 'https://www.bestbuy.com/', country: 'US' },
  { name: 'Target', label: 'Top Deals', href: 'https://www.target.com/', country: 'US' },
  { name: 'Costco', label: 'Savings', href: 'https://www.costco.com/', country: 'US' },
  { name: 'The Home Depot', label: 'Special Buys', href: 'https://www.homedepot.com/', country: 'US' },
  { name: 'Newegg', label: 'Daily Deals', href: 'https://www.newegg.com/', country: 'US' },
  { name: 'Walmart Canada', label: 'Rollbacks', href: 'https://www.walmart.ca/', country: 'CA' },
  { name: 'Best Buy Canada', label: 'Top Deals', href: 'https://www.bestbuy.ca/', country: 'CA' },
  { name: 'Canadian Tire', label: 'Weekly Flyer', href: 'https://www.canadiantire.ca/', country: 'CA' },
  { name: 'Woot', label: 'Daily Deal', href: 'https://www.woot.com/', country: 'US' },
]

export function DealHubs() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-rule border border-rule">
      {DEAL_HUBS.map(h => (
        <a key={h.name} href={h.href} target="_blank" rel="noopener sponsored" className="bg-white p-4 hover:bg-paper-2 transition-colors group">
          <div className="text-[10px] tracking-[0.18em] text-ink-muted mb-1">{h.country === 'CA' ? 'CANADA' : 'UNITED STATES'}</div>
          <div className="font-serif text-lg text-ink group-hover:text-accent leading-tight">{h.name}</div>
          <div className="text-xs text-ink-2">{h.label} ↗</div>
        </a>
      ))}
    </div>
  )
}

export function CtaBand() {
  const items: Array<[string, string, string, string]> = [
    ['GIVEAWAY', 'Enter this month’s Daily Draw', 'Free to enter. One winner drawn every month.', '/contests'],
    ['DEAL CONCIERGE', 'Tell us what you’re hunting for', 'We watch prices and email you when it drops.', '/concierge'],
    ['SUPPORT', 'Keep Daily.Deals free', 'Fund operations, promotion, new hires and prizes.', '/support'],
    ['FOR BRANDS', 'Advertise, sponsor or partner', 'Featured placements, newsletter slots and more.', '/advertise'],
  ]
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
      {items.map(([e, t, s, h]) => (
        <Link key={h} href={h} className="bg-white p-6 hover:bg-paper-2 transition-colors group">
          <div className="section-eyebrow mb-2 text-accent">{e}</div>
          <div className="font-serif text-xl text-ink leading-snug mb-1 group-hover:text-accent">{t}</div>
          <p className="text-xs text-ink-2">{s}</p>
        </Link>
      ))}
    </section>
  )
}

export function Prose({ sections }: { sections: Array<{ h: string; body: string[] }> }) {
  return (
    <div className="space-y-8">
      {sections.map(s => (
        <section key={s.h} id={s.h.toLowerCase().replace(/^\d+\.\s*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}>
          <h2 className="font-serif text-2xl text-ink mb-3 scroll-mt-28">{s.h}</h2>
          <Body lines={s.body} />
        </section>
      ))}
    </div>
  )
}

export function Body({ lines }: { lines: string[] }) {
  const out: React.ReactNode[] = []
  let list: string[] = []
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`} className="list-disc pl-5 space-y-1.5 text-ink-2 leading-relaxed">{list.map((l, i) => <li key={i}>{l}</li>)}</ul>); list = [] } }
  lines.forEach((l, i) => {
    if (l.startsWith('- ')) list.push(l.slice(2))
    else { flush(); out.push(<p key={i} className="text-ink-2 leading-relaxed">{l}</p>) }
  })
  flush()
  return <div className="space-y-3">{out}</div>
}
