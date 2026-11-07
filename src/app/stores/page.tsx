import { Metadata } from 'next'
import Link from 'next/link'
import { getRetailers } from '@/lib/data'
import { STORE_GUIDES } from '@/lib/stores'
import { PageHero, SectionHead, DealHubs } from '@/components/ui/Editorial'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'All Stores — Deals & Coupons by Retailer',
  description: 'Browse deals, coupons and savings guides for major US and Canadian retailers including Amazon, Walmart, Best Buy, Target, Costco, Home Depot and Canadian Tire.',
  alternates: { canonical: '/stores' },
}

export default async function StoresPage() {
  const db = (await getRetailers(200)) as any[]
  const map = new Map<string, { slug: string; name: string; country: string }>()
  STORE_GUIDES.forEach(s => map.set(s.slug, { slug: s.slug, name: s.name, country: s.country }))
  db.forEach(r => { if (!map.has(r.slug)) map.set(r.slug, { slug: r.slug, name: r.name, country: r.country }) })
  const all = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  const group = (c: string) => all.filter(s => s.country === c || s.country === 'BOTH')
  return (
    <main>
      <PageHero eyebrow="DIRECTORY" title="Deals by store" dek="Every retailer we track, with live deals, coupon strategy and the best times to buy." />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {(['US', 'CA'] as const).map((c, i) => (
          <section key={c}>
            <SectionHead n={`0${i + 1}`} eyebrow={c === 'US' ? 'UNITED STATES' : 'CANADA'} title={c === 'US' ? 'US retailers' : 'Canadian retailers'} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-rule border border-rule">
              {group(c).map(s => (
                <Link key={s.slug + c} href={`/store/${s.slug}`} className="bg-white p-5 hover:bg-paper-2 group">
                  <div className="font-serif text-lg text-ink group-hover:text-accent leading-tight">{s.name}</div>
                  <div className="text-[11px] text-ink-muted tracking-wider mt-1">DEALS →</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section>
          <SectionHead n="03" eyebrow="OFFICIAL DEAL PAGES" title="Straight from the retailers" />
          <DealHubs />
        </section>
      </div>
    </main>
  )
}
