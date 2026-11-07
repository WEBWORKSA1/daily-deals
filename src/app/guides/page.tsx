import { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES } from '@/lib/guides'
import { PageHero } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'Shopping Guides — Save Smarter on Everything',
  description: 'Original, practical shopping guides from Daily.Deals: spotting fake discounts, Black Friday strategy, the best time to buy, coupon stacking, price matching, Canadian shopping and more.',
  alternates: { canonical: '/guides' },
}

export default function GuidesPage() {
  const topics = Array.from(new Set(GUIDES.map(g => g.topic)))
  return (
    <main>
      <PageHero eyebrow="THE LIBRARY" title="Shopping guides" dek="Practical, original advice for paying less without wasting your weekend. Written by our editors, updated as retail changes." />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {topics.map((t, i) => (
          <section key={t}>
            <div className="section-eyebrow mb-2">SECTION {String(i + 1).padStart(2, '0')}</div>
            <h2 className="section-h2 mb-5">{t}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
              {GUIDES.filter(g => g.topic === t).map(g => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="bg-white p-6 hover:bg-paper-2 group">
                  <div className="text-[11px] tracking-wider text-ink-muted mb-2">{g.minutes} MIN READ · UPDATED {new Date(g.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
                  <h3 className="font-serif text-xl text-ink leading-snug mb-2 group-hover:text-accent">{g.title}</h3>
                  <p className="text-sm text-ink-2">{g.dek}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
