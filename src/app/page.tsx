import { Metadata } from 'next'
import Link from 'next/link'
import { ensureBootstrapped } from '@/lib/autoBootstrap'
import { getDeals, getSiteStats, getRetailers } from '@/lib/data'
import { getVideos } from '@/lib/videos'
import { GUIDES } from '@/lib/guides'
import { CATEGORIES } from '@/lib/utils'
import HeroSection from '@/components/ui/HeroSection'
import StoreGrid from '@/components/ui/StoreGrid'
import FeaturedDeal from '@/components/ui/FeaturedDeal'
import DealTicker from '@/components/ui/DealTicker'
import LocalDealsSection from '@/components/ui/LocalDealsSection'
import InstallPrompt from '@/components/ui/InstallPrompt'
import { SectionHead, DealGrid, DealHubs, CtaBand } from '@/components/ui/Editorial'
import ConciergeInline from '@/components/forms/ConciergeInline'
import VideoCard from '@/components/ui/VideoCard'
import AdSlot from '@/components/ads/AdSlot'
import SafeImg from '@/components/ui/SafeImg'

export const metadata: Metadata = {
  title: 'Daily.Deals — Daily Deals. Every Day. | Best Deals in the US & Canada',
  description: "Today's best deals, coupons and price drops from major US and Canadian retailers — scored, de-duplicated and refreshed around the clock. Free price alerts, shopping guides and a monthly giveaway.",
  alternates: { canonical: '/' },
}

export const revalidate = 600

export default async function HomePage() {
  if (process.env.NEXT_PHASE !== 'phase-production-build') ensureBootstrapped().catch(() => {})

  const [hot, featured, flash, us, ca, clearance, stats, retailers, videos] = await Promise.all([
    getDeals({ feed: 'hot', limit: 18 }),
    getDeals({ feed: 'featured', limit: 4 }),
    getDeals({ feed: 'flash', limit: 10 }),
    getDeals({ feed: 'us', limit: 6 }),
    getDeals({ feed: 'canada', limit: 6 }),
    getDeals({ feed: 'clearance', limit: 10 }),
    getSiteStats(),
    getRetailers(20),
    getVideos().catch(() => []),
  ])

  const withImg = [...featured, ...hot].filter(d => d.image_url)
  const spotlight = withImg[0] || hot[0] || null
  const featureDeal = withImg.find(d => d.id !== spotlight?.id) || null
  const bodyHot = hot.filter(d => d.id !== spotlight?.id && d.id !== featureDeal?.id).slice(0, 15)
  const total = stats.dbActive + stats.live

  return (
    <>
      <DealTicker deals={[...flash, ...hot].slice(0, 12)} />
      <main>
        <HeroSection totalDeals={total} spotlightDeal={spotlight} sourceCount={stats.sources + (stats.dbActive > 0 ? 1 : 0)} />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

          {featureDeal && (
            <section>
              <SectionHead n="01" eyebrow="TODAY’S SPOTLIGHT" title="Featured Daily Deal" sub="A standout offer from this hour’s edition." href="/deals/today" hrefLabel="Read the Daily Edition" />
              <FeaturedDeal deal={featureDeal} />
            </section>
          )}

          <section>
            <SectionHead n="02" eyebrow="RANKED BY HOTNESS" title="Daily Hot Deals" sub="Discount depth, freshness, price credibility and shopper activity — re-ranked automatically all day." href="/deals/hot" />
            <DealGrid deals={bodyHot} ranked />
          </section>

          {/* LEAD GENERATION — dedicated, high-intent capture */}
          <section id="concierge" className="border border-ink bg-white">
            <div className="grid lg:grid-cols-[1fr_1.15fr]">
              <div className="p-8 lg:p-12 bg-paper-2 border-b lg:border-b-0 lg:border-r border-rule">
                <div className="section-eyebrow mb-3 text-accent">SECTION 03 · DEAL CONCIERGE · FREE</div>
                <h2 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-[1.02] mb-5">
                  Tell us what you want.<br />We’ll tell you when it’s cheap.
                </h2>
                <p className="text-ink-2 leading-relaxed mb-6 max-w-md">
                  Name the product and the price you’d pay. Our deal desk watches every source we track, around the clock, and emails you the moment a match appears.
                </p>
                <ul className="space-y-3 text-sm text-ink">
                  {[
                    ['Set your price', 'You decide the target — we only alert at or below it.'],
                    ['Watched continuously', 'Fresh deals are checked against your request every time our feeds refresh.'],
                    ['US and Canada', 'Storefronts in your country, in your currency.'],
                    ['Free, no spam', 'Unsubscribe in one click. We never sell your email.'],
                  ].map(([t, s]) => (
                    <li key={t} className="flex gap-3"><span className="text-accent font-mono">✓</span><span><strong className="font-medium">{t}.</strong> <span className="text-ink-2">{s}</span></span></li>
                  ))}
                </ul>
              </div>
              <div className="p-8 lg:p-12">
                <ConciergeInline />
              </div>
            </div>
          </section>

          {flash.length > 0 && (
            <section>
              <SectionHead n="04" eyebrow="TIME-SENSITIVE" title="Daily Flash Deals" sub="Short-window markdowns. Move fast." href="/deals/flash" />
              <DealGrid deals={flash} />
            </section>
          )}

          <AdSlot kind="leaderboard" />

          {(us.length > 0 || ca.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section>
                <SectionHead n="05" eyebrow="UNITED STATES" title="Daily US Deals" href="/deals/us" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{us.map(d => <MiniCard key={d.id} d={d} />)}</div>
              </section>
              <section>
                <SectionHead n="06" eyebrow="CANADA" title="Daily Canadian Deals" href="/deals/canada" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{ca.map(d => <MiniCard key={d.id} d={d} />)}</div>
              </section>
            </div>
          )}

          {clearance.length > 0 && (
            <section>
              <SectionHead n="07" eyebrow="LAST CALL" title="Daily Clearance Deals" sub="Closeouts, open-box and final-call inventory." href="/deals/clearance" />
              <DealGrid deals={clearance} />
            </section>
          )}

          <section>
            <SectionHead n="08" eyebrow="BROWSE" title="Shop by category" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-rule border border-rule">
              {CATEGORIES.map(c => (
                <Link key={c.slug} href={`/category/${c.slug}`} className="bg-white px-4 py-5 hover:bg-paper-2 group">
                  <div className="font-serif text-lg text-ink group-hover:text-accent">{c.label}</div>
                  <div className="text-[11px] text-ink-muted tracking-wider">DEALS →</div>
                </Link>
              ))}
              <Link href="/coupons" className="bg-white px-4 py-5 hover:bg-paper-2 group">
                <div className="font-serif text-lg text-accent">Coupons</div>
                <div className="text-[11px] text-ink-muted tracking-wider">BY STORE →</div>
              </Link>
            </div>
          </section>

          {stats.dbActive > 0 && <LocalDealsSection />}

          <section>
            <SectionHead n="09" eyebrow="THE SMART SHOPPER’S LIBRARY" title="Shopping guides" sub="Original, practical guides from our editors." href="/guides" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
              {GUIDES.slice(0, 6).map(g => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="bg-white p-6 hover:bg-paper-2 group">
                  <div className="section-eyebrow mb-2">{g.topic.toUpperCase()} · {g.minutes} MIN</div>
                  <h3 className="font-serif text-xl text-ink leading-snug mb-2 group-hover:text-accent">{g.title}</h3>
                  <p className="text-sm text-ink-2 line-clamp-3">{g.dek}</p>
                </Link>
              ))}
            </div>
          </section>

          {videos.length > 0 && (
            <section>
              <SectionHead n="10" eyebrow="WATCH BEFORE YOU BUY" title="Latest reviews & buying advice" sub="Fresh videos from trusted reviewers, updated automatically." href="/videos" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {videos.slice(0, 4).map(v => <VideoCard key={v.id} v={v} />)}
              </div>
            </section>
          )}

          <CtaBand />

          <section>
            <SectionHead n="11" eyebrow="OFFICIAL DEAL PAGES" title="Straight from the retailers" sub="Each store’s own deal page, checked daily." />
            <DealHubs />
          </section>

          {retailers.length > 0 && (
            <section>
              <SectionHead n="12" eyebrow="DIRECTORY" title="Daily Deals by Store" sub="Browse deals and coupons from the retailers you shop most." href="/stores" hrefLabel="All stores" />
              <StoreGrid retailers={retailers as any} />
            </section>
          )}
        </div>
      </main>
      <InstallPrompt />
    </>
  )
}

function MiniCard({ d }: { d: import('@/types').Deal }) {
  const href = d.is_live ? d.out_url! : `/deal/${d.id}`
  const pct = d.discount_percent || 0
  return (
    <a href={href} target={d.is_live ? '_blank' : undefined} rel={d.is_live ? 'noopener sponsored' : undefined} className="border border-rule hover:border-ink p-3 flex flex-col bg-white group">
      <div className="aspect-[4/3] bg-paper-2 mb-2 overflow-hidden">
        {d.image_url && <SafeImg src={d.image_url} className="w-full h-full object-cover" />}
      </div>
      <div className="badge-eyebrow truncate mb-1">{d.retailer_name}</div>
      <div className="text-xs text-ink line-clamp-2 mb-2 group-hover:text-accent">{d.title}</div>
      <div className="mt-auto flex items-baseline gap-2">
        <span className="font-mono text-accent text-sm">{d.deal_price === 0 ? 'FREE' : (d.country === 'CA' ? 'C$' : '$') + d.deal_price.toFixed(2).replace(/\.00$/, '')}</span>
        {pct > 0 && <span className="text-[10px] text-good">-{pct}%</span>}
      </div>
    </a>
  )
}
