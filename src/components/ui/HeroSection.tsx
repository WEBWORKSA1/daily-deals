'use client'
import { useLocation } from '@/hooks/useLocation'
import Link from 'next/link'

export default function HeroSection({ totalDeals }: { totalDeals: number }) {
  const { location, loading } = useLocation()

  return (
    <section className="relative bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">

          {/* LEFT — EDITORIAL HEADLINE */}
          <div>
            <div className="section-eyebrow mb-4">
              {loading ? 'DETECTING LOCATION…' : location
                ? `EDITION FOR ${location.city.toUpperCase()}, ${location.stateCode}`
                : 'NORTH AMERICAN EDITION'}
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-[-0.025em] text-ink mb-5">
              Daily Deals.<br />
              <span className="text-accent">Every Day.</span>
            </h1>

            <p className="text-ink-2 text-base lg:text-lg leading-relaxed max-w-xl mb-7">
              Hand-picked discounts from 1,000+ retailers across the US and Canada. Verified by editors. Updated every 24 hours. Always free.
            </p>

            {/* STATS ROW — newspaper rule lines, mono numbers */}
            <div className="grid grid-cols-3 gap-6 py-5 border-t border-b border-rule mb-7 max-w-lg">
              <div>
                <div className="font-mono text-2xl font-medium text-ink tabular-nums leading-none">
                  {totalDeals > 0 ? totalDeals : '128'}
                </div>
                <div className="text-[10px] tracking-[0.15em] text-ink-muted mt-1.5">LIVE TODAY</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-medium text-ink tabular-nums leading-none">43,140</div>
                <div className="text-[10px] tracking-[0.15em] text-ink-muted mt-1.5">ZIPS COVERED</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-medium text-ink tabular-nums leading-none">1,000+</div>
                <div className="text-[10px] tracking-[0.15em] text-ink-muted mt-1.5">RETAILERS</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/deals/today" className="btn-primary">
                Browse all deals →
              </Link>
              <Link href="/deals/flash" className="btn-outline">
                Daily Flash Deals
              </Link>
            </div>
          </div>

          {/* RIGHT — FEATURED DAILY DEAL CARD (magazine-cover slot) */}
          <div className="bg-white border border-ink p-6 lg:p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" aria-hidden />
              <span className="text-[11px] tracking-[0.2em] text-accent font-medium">FEATURED DAILY DEAL</span>
            </div>

            <div className="bg-paper-2 border border-rule h-44 sm:h-56 mb-5 flex items-center justify-center text-ink-muted">
              <span className="text-xs tracking-widest">FEATURED PRODUCT</span>
            </div>

            <div className="badge-eyebrow mb-2">ELECTRONICS · AMAZON</div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium leading-tight text-ink mb-4">
              Sony WH-1000XM5 Wireless Noise-Cancelling Headphones
            </h2>

            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-mono text-3xl font-medium text-accent tabular-nums leading-none">$299</span>
              <span className="font-mono text-base text-ink-muted line-through tabular-nums">$399</span>
              <span className="badge-discount">-25%</span>
            </div>

            <Link href="/deals/today" className="btn-primary w-full justify-center">
              Get this deal →
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
