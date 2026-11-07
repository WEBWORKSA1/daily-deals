import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STORE_GUIDES, getStoreGuide } from '@/lib/stores'
import { getDeals } from '@/lib/data'
import { PageHero, SectionHead, DealGrid } from '@/components/ui/Editorial'
import AdSlot from '@/components/ads/AdSlot'
import ConciergeInline from '@/components/forms/ConciergeInline'
import { monetize } from '@/lib/feeds/live'

export const revalidate = 900
interface Props { params: { slug: string } }

export function generateStaticParams() { return STORE_GUIDES.map(s => ({ slug: s.slug })) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getStoreGuide(params.slug)
  if (!s) return { title: 'Store not found' }
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return {
    title: `${s.name} Coupons & Promo Codes (${month}) — Savings Guide`,
    description: `How to save at ${s.name}: loyalty perks, coupon stacking rules, the best times to buy, and today’s live ${s.name} deals.`,
    alternates: { canonical: `/coupons/${s.slug}` },
  }
}

export default async function StoreCouponsPage({ params }: Props) {
  const s = getStoreGuide(params.slug)
  if (!s) notFound()
  const deals = await getDeals({ store: s.slug.replace(/-ca$/, ''), limit: 10 })
  const country = s.country === 'CA' ? 'CA' : 'US'
  const faq = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `How can I save at ${s.name}?`, acceptedAnswer: { '@type': 'Answer', text: s.tips.join(' ') } },
      { '@type': 'Question', name: `When is the best time to buy at ${s.name}?`, acceptedAnswer: { '@type': 'Answer', text: s.bestTimes } },
      { '@type': 'Question', name: `Does ${s.name} have a loyalty program?`, acceptedAnswer: { '@type': 'Answer', text: s.loyalty } },
    ],
  }
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <PageHero eyebrow={`COUPONS · ${s.name.toUpperCase()}`} title={`${s.name} coupons & savings guide`} dek={s.about}>
        <a href={monetize(s.url, country)} target="_blank" rel="noopener sponsored" className="btn-accent">Shop {s.name} deals ↗</a>
      </PageHero>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-10">
          <section>
            <SectionHead n="01" eyebrow="STRATEGY" title={`How to save at ${s.name}`} />
            <ul className="list-disc pl-5 space-y-2 text-ink-2 leading-relaxed">{s.tips.map(t => <li key={t}>{t}</li>)}</ul>
          </section>
          <section className="grid sm:grid-cols-2 gap-6">
            <div className="border border-rule p-5"><div className="section-eyebrow mb-2">LOYALTY & MEMBERSHIP</div><p className="text-sm text-ink-2">{s.loyalty}</p></div>
            <div className="border border-rule p-5"><div className="section-eyebrow mb-2">BEST TIMES TO BUY</div><p className="text-sm text-ink-2">{s.bestTimes}</p></div>
          </section>
          <AdSlot kind="article" />
          <section>
            <SectionHead n="02" eyebrow="LIVE" title={`Today’s ${s.name} deals`} href={`/store/${s.slug}`} />
            <DealGrid deals={deals} empty={<p className="text-sm text-ink-2">No live {s.name} deals in our feeds this hour. Use the button above to browse {s.name}’s own deal page, or ask our Deal Concierge to watch a product for you.</p>} />
          </section>
          <p className="text-xs text-ink-muted">We don’t publish codes we can’t see working in a live deal. Policies and programs change — check {s.name}’s website for current terms. {s.name} is a trademark of its owner; Daily.Deals is independent and not affiliated with or endorsed by {s.name}.</p>
        </div>
        <aside className="space-y-6">
          <div className="border border-ink p-6">
            <div className="section-eyebrow mb-2 text-accent">DEAL CONCIERGE</div>
            <h2 className="font-serif text-2xl text-ink mb-4">Watch a {s.name} price for me</h2>
            <ConciergeInline compact />
          </div>
          <div className="border border-rule p-5">
            <div className="section-eyebrow mb-2">MORE STORES</div>
            <ul className="space-y-1.5 text-sm">{STORE_GUIDES.filter(x => x.slug !== s.slug).slice(0, 8).map(x => <li key={x.slug}><Link href={`/coupons/${x.slug}`} className="text-ink-2 hover:text-accent">{x.name} coupons</Link></li>)}</ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
