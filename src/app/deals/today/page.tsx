import { Metadata } from 'next'
import Link from 'next/link'
import { getEdition } from '@/lib/edition'
import { formatPrice } from '@/lib/utils'
import { DealGrid, SectionHead, EmptyDeals, DealHubs } from '@/components/ui/Editorial'
import AdSlot from '@/components/ads/AdSlot'
import ConciergeInline from '@/components/forms/ConciergeInline'
import type { Deal } from '@/types'
import SafeImg from '@/components/ui/SafeImg'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'The Daily Edition — Today’s 10 Best Deals',
  description: 'A fresh, automatically curated front page every morning: the ten best deals of the day with short editorial notes, plus category picks across tech, home, gaming and more.',
  alternates: { canonical: '/deals/today' },
}

function hrefFor(d: Deal) { return d.is_live ? d.out_url! : `/deal/${d.id}` }

export default async function DailyEditionPage() {
  const ed = await getEdition()
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: `Daily.Deals — The Daily Edition, ${ed.dateLabel}`,
    itemListElement: ed.top.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.deal.title })),
  }
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <section className="border-b border-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="section-eyebrow mb-3">THE DAILY EDITION · {ed.dateLabel.toUpperCase()}</div>
          <h1 className="font-serif text-5xl sm:text-6xl font-medium tracking-tight text-ink leading-none mb-5">Today’s ten best deals.</h1>
          <p className="text-ink-2 text-lg leading-relaxed max-w-2xl mx-auto">{ed.intro}</p>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {ed.top.length === 0 ? <EmptyDeals /> : (
          <section className="max-w-4xl mx-auto">
            <ol className="divide-y divide-rule border-y border-ink">
              {ed.top.map((t, i) => (
                <li key={t.deal.id} className="py-6 grid grid-cols-[3rem_1fr] sm:grid-cols-[3rem_120px_1fr] gap-4 items-start">
                  <div className="font-serif text-4xl text-accent leading-none">{i + 1}</div>
                  <div className="hidden sm:block bg-paper-2 border border-rule aspect-square overflow-hidden">
                    {t.deal.image_url ? <SafeImg src={t.deal.image_url} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div>
                    <div className="badge-eyebrow mb-1">{(t.deal.retailer_name || '').toUpperCase()} · {t.deal.category.toUpperCase()}</div>
                    <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug mb-2">
                      <a href={hrefFor(t.deal)} target={t.deal.is_live ? '_blank' : undefined} rel={t.deal.is_live ? 'noopener sponsored' : undefined} className="hover:text-accent">{t.deal.title}</a>
                    </h2>
                    <p className="text-sm text-ink-2 leading-relaxed mb-3">{t.blurb}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="price-now">{formatPrice(t.deal.deal_price, t.deal.country)}</span>
                      {t.deal.original_price && <span className="price-was">{formatPrice(t.deal.original_price, t.deal.country)}</span>}
                      <a href={hrefFor(t.deal)} target={t.deal.is_live ? '_blank' : undefined} rel={t.deal.is_live ? 'noopener sponsored' : undefined} className="btn-primary !py-1.5 !px-3 !text-xs">
                        {t.deal.is_live ? `Shop at ${t.deal.retailer_name} →` : 'See the deal →'}
                      </a>
                      {t.deal.is_live && t.deal.source_url && (
                        <a href={t.deal.source_url} target="_blank" rel="noopener nofollow" className="text-[11px] text-ink-muted hover:text-ink">via {t.deal.source_name} ↗</a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <AdSlot kind="article" />

        {ed.byCategory.map((g, i) => (
          <section key={g.category}>
            <SectionHead n={String(i + 2).padStart(2, '0')} eyebrow="CATEGORY DESK" title={`${g.category} picks`} />
            <DealGrid deals={g.items.map(x => x.deal)} />
          </section>
        ))}

        <section className="grid lg:grid-cols-2 gap-10 border-t border-rule pt-12">
          <div>
            <SectionHead eyebrow="NEVER MISS AN EDITION" title="Want this in your inbox — or a price watched?" sub="Tell us what you’re shopping for. We’ll email the edition and alert you when your price hits." />
            <ConciergeInline compact />
          </div>
          <div>
            <div className="section-eyebrow mb-3">HOW THE EDITION IS MADE</div>
            <div className="space-y-3 text-sm text-ink-2 leading-relaxed">
              <p>The Daily Edition is assembled automatically every morning and refreshed through the day. Our system collects offers from retailer pages and established deal sources across the US and Canada, removes duplicates, and scores each one on discount depth, freshness, price credibility and shopper activity.</p>
              <p>The notes beside each pick explain what makes it notable and what to check before you buy. Retailers set prices and stock — always confirm the final total at checkout.</p>
              <p><Link href="/about#how-we-pick" className="underline text-ink">Read our editorial standards</Link> · <Link href="/disclosure" className="underline text-ink">How we make money</Link></p>
            </div>
          </div>
        </section>

        <section>
          <SectionHead eyebrow="OFFICIAL DEAL PAGES" title="Straight from the retailers" />
          <DealHubs />
        </section>
      </div>
    </main>
  )
}
