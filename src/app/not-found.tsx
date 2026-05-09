// Global 404 — shown for any URL that doesn't match a route or when notFound() is called.
// Designed to feel like part of Daily.Deals, not a Next.js default error.

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Page not found — Daily.Deals',
  description: "The page you're looking for has expired or moved. Today's deals are on the homepage.",
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="section-eyebrow mb-3">404 · NOT IN TODAY&apos;S EDITION</div>
        <h1 className="font-serif text-5xl lg:text-6xl font-medium tracking-tight text-ink mb-4 leading-[1.05]">
          This deal isn&apos;t available right now.
        </h1>
        <p className="text-ink-2 text-base leading-relaxed mb-8 max-w-xl">
          Deals expire fast. The page you&apos;re looking for has either ended, moved, or hasn&apos;t been published yet. Today&apos;s edition is on the homepage — fresh deals are added every six hours.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link href="/" className="btn-primary">
            Today&apos;s deals →
          </Link>
          <Link href="/deals/hot" className="btn-outline">
            Browse all daily hot deals
          </Link>
        </div>

        <div className="border-t border-rule pt-8">
          <div className="section-eyebrow mb-3">SHORTCUTS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm">
            <Link href="/deals/hot"       className="text-ink-2 hover:text-ink">Daily Hot Deals</Link>
            <Link href="/deals/flash"     className="text-ink-2 hover:text-ink">Daily Flash Deals</Link>
            <Link href="/deals/clearance" className="text-ink-2 hover:text-ink">Daily Clearance</Link>
            <Link href="/deals/us"        className="text-ink-2 hover:text-ink">Daily US Deals</Link>
            <Link href="/deals/canada"    className="text-ink-2 hover:text-ink">Daily Canadian Deals</Link>
            <Link href="/stores"          className="text-ink-2 hover:text-ink">All Stores</Link>
            <Link href="/category/electronics" className="text-ink-2 hover:text-ink">Electronics</Link>
            <Link href="/category/fashion"     className="text-ink-2 hover:text-ink">Fashion</Link>
            <Link href="/category/home-kitchen" className="text-ink-2 hover:text-ink">Home &amp; Kitchen</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
