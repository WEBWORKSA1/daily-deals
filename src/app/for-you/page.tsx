'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealCard from '@/components/deals/DealCard'
import { Deal } from '@/types'

interface Insights {
  favoriteCategories: string[]
  favoriteRetailers: string[]
  totalSignals: number
}

export default function ForYouPage() {
  const router = useRouter()
  const [feed, setFeed] = useState<Deal[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/for-you')
        if (res.status === 401) {
          setSignedIn(false)
          setLoading(false)
          return
        }
        const json = await res.json()
        setFeed(json.feed || [])
        setInsights(json.insights || null)
        setSignedIn(true)
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-screen-2xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-dark-3 border border-white/5 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!signedIn) {
    return (
      <>
        <Header />
        <main>
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="font-heading text-4xl font-900 text-white uppercase mb-3">For You</h1>
            <p className="text-brand-gray text-base mb-6">
              A personalized deal feed that learns from what you save and upvote.
              Sign in to start training your feed.
            </p>
            <Link href="/signin" className="btn-primary inline-flex">Sign In to Start →</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-brand-red py-12">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-white/90 text-sm hover:text-white">← Back to home</Link>
            <h1 className="font-heading text-4xl sm:text-5xl font-900 text-white uppercase tracking-tight mt-2">
              ✨ For You
            </h1>
            <p className="text-white/90 text-base mt-2 max-w-xl">
              Personalized deals based on what you save, vote on, and click.
              {insights && insights.totalSignals < 5 &&
                ' Save and vote on a few deals to make this even sharper.'}
            </p>
          </div>
        </section>

        {/* INSIGHTS PANEL */}
        {insights && insights.totalSignals > 0 && (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <span className="text-brand-gray text-xs uppercase tracking-wider font-bold">You like:</span>
              {insights.favoriteCategories.slice(0, 4).map(c => (
                <Link key={c} href={`/category/${c.toLowerCase()}`}
                  className="text-xs bg-brand-red/10 text-brand-red border border-brand-red/20
                             px-2 py-1 rounded-md hover:bg-brand-red/20">
                  {c}
                </Link>
              ))}
              {insights.favoriteRetailers.slice(0, 4).map(r => (
                <Link key={r} href={`/store/${r}`}
                  className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/20
                             px-2 py-1 rounded-md hover:bg-brand-gold/20 capitalize">
                  {r.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {feed.length === 0 ? (
            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-12 text-center">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="text-white text-lg font-bold mb-2">Your feed is being trained</h3>
              <p className="text-brand-gray text-sm mb-4">
                Save a few deals and vote on what you like. Come back to see your personalized picks.
              </p>
              <Link href="/" className="btn-primary inline-flex">Browse all deals</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {feed.map(deal => <DealCard key={deal.id} deal={deal} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
