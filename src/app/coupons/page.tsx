import { Metadata } from 'next'
import Link from 'next/link'
import { STORE_GUIDES } from '@/lib/stores'
import { getDeals } from '@/lib/data'
import { PageHero, SectionHead, DealGrid } from '@/components/ui/Editorial'
import AdSlot from '@/components/ads/AdSlot'

export const revalidate = 900
export const metadata: Metadata = {
  title: 'Coupons & Promo Codes by Store — Plus How to Stack Them',
  description: 'Store-by-store coupon strategy for Amazon, Walmart, Target, Best Buy, Costco, Home Depot, Kohl’s, Macy’s, Nike and Canadian Tire — plus live deals with codes.',
  alternates: { canonical: '/coupons' },
}

export default async function CouponsPage() {
  const withCodes = await getDeals({ feed: 'coupons', limit: 15 })
  return (
    <main>
      <PageHero eyebrow="COUPONS" title="Coupons, codes & savings strategy" dek="Real coupon codes are rarer than coupon sites suggest. Here is what actually works at each store — and the live deals that carry a code right now." />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {withCodes.length > 0 && (
          <section>
            <SectionHead n="01" eyebrow="LIVE CODES" title="Deals with a code today" sub="Codes are shown on each card. Confirm the discount at checkout." />
            <DealGrid deals={withCodes} />
          </section>
        )}
        <section>
          <SectionHead n="02" eyebrow="BY STORE" title="Store savings guides" sub="Loyalty programs, stacking rules and the best times to buy at each retailer." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {STORE_GUIDES.map(s => (
              <Link key={s.slug} href={`/coupons/${s.slug}`} className="bg-white p-6 hover:bg-paper-2 group">
                <div className="section-eyebrow mb-1">{s.country === 'CA' ? 'CANADA' : s.country === 'BOTH' ? 'US & CANADA' : 'UNITED STATES'}</div>
                <div className="font-serif text-xl text-ink group-hover:text-accent">{s.name} coupons</div>
                <p className="text-xs text-ink-2 mt-1 line-clamp-2">{s.loyalty}</p>
              </Link>
            ))}
          </div>
        </section>
        <AdSlot kind="leaderboard" />
        <section className="max-w-3xl">
          <SectionHead n="03" eyebrow="METHOD" title="How to stack savings in the right order" />
          <ol className="list-decimal pl-5 space-y-2 text-ink-2">
            <li>Start from the sale price — compare it to recent price history.</li>
            <li>Add a valid store or brand promo code at checkout.</li>
            <li>Pay with a discounted gift card if the store sells them through a trusted channel.</li>
            <li>Start from a cashback portal link so the purchase tracks.</li>
            <li>Pay with a rewards card you clear in full.</li>
          </ol>
          <p className="mt-4"><Link href="/guides/coupon-stacking-and-cashback" className="underline">Read the full stacking guide →</Link></p>
        </section>
      </div>
    </main>
  )
}
