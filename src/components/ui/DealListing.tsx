import Link from 'next/link'
import { getDeals, DealQuery } from '@/lib/data'
import { DealGrid, PageHero, SectionHead, DealHubs } from '@/components/ui/Editorial'
import AdSlot from '@/components/ads/AdSlot'
import ConciergeInline from '@/components/forms/ConciergeInline'
import { GUIDES } from '@/lib/guides'

interface Props {
  eyebrow: string
  title: string
  dek: string
  query: DealQuery
  ranked?: boolean
  explainer?: { h: string; body: string }[]
  guideSlugs?: string[]
}

/** Shared server layout for every deal listing: hero, ranked grid, ad, lead capture, guides, hubs. */
export default async function DealListing({ eyebrow, title, dek, query, ranked, explainer, guideSlugs }: Props) {
  const deals = await getDeals({ limit: 40, ...query })
  const guides = (guideSlugs?.length ? GUIDES.filter(g => guideSlugs.includes(g.slug)) : GUIDES.slice(0, 3)).slice(0, 3)
  const updated = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return (
    <main>
      <PageHero eyebrow={eyebrow} title={title} dek={dek}>
        <div className="text-[11px] tracking-[0.15em] text-ink-muted">{deals.length} DEALS · UPDATED {updated.toUpperCase()} ET</div>
      </PageHero>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        <section>
          <DealGrid deals={deals.slice(0, 20)} ranked={ranked} />
        </section>
        <AdSlot kind="leaderboard" />
        {deals.length > 20 && (
          <section>
            <SectionHead eyebrow="MORE" title="More picks from today’s edition" />
            <DealGrid deals={deals.slice(20)} />
          </section>
        )}
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-10 border-t border-rule pt-12">
          <div>
            <SectionHead eyebrow="DEAL CONCIERGE" title="Not seeing what you need?" sub="Tell us the product and your target price. We watch every source and email you the moment it drops." />
            <ConciergeInline compact />
          </div>
          <div>
            {explainer && explainer.length > 0 && (
              <div className="mb-8 space-y-4">
                <div className="section-eyebrow">HOW THIS PAGE WORKS</div>
                {explainer.map(e => (
                  <div key={e.h}><h3 className="font-serif text-lg text-ink">{e.h}</h3><p className="text-sm text-ink-2 leading-relaxed">{e.body}</p></div>
                ))}
              </div>
            )}
            <div className="section-eyebrow mb-3">SHOPPING GUIDES</div>
            <ul className="divide-y divide-rule border-y border-rule">
              {guides.map(g => (
                <li key={g.slug}><Link href={`/guides/${g.slug}`} className="block py-3 group">
                  <div className="font-serif text-lg text-ink group-hover:text-accent leading-snug">{g.title}</div>
                  <div className="text-xs text-ink-muted">{g.minutes} min read</div>
                </Link></li>
              ))}
            </ul>
          </div>
        </section>
        <section>
          <SectionHead eyebrow="OFFICIAL DEAL PAGES" title="Straight from the retailers" sub="Each store’s own deal page, one click away." />
          <DealHubs />
        </section>
      </div>
    </main>
  )
}
