'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function CashbackPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    fetch('/api/cashback', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { setSignedIn(false); setLoading(false); return null }
        setSignedIn(true)
        return r.json()
      })
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-screen-xl mx-auto px-4 py-20">
          <div className="text-brand-gray">Loading…</div>
        </div>
        <Footer />
      </>
    )
  }

  if (!signedIn) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-brand-bg">
          <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
            <h1 className="font-heading text-4xl font-900 text-white uppercase">💰 Cashback</h1>
            <p className="text-brand-gray mt-4">Sign in to start earning cashback on every deal you click.</p>
            <Link
              href="/signin?redirect=/cashback"
              className="inline-block mt-6 bg-brand-red hover:bg-red-700 text-white font-bold px-8 py-3 rounded"
            >
              Sign in to Daily.Deals
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const balance = data?.balance || {}
  const events = data?.events || []
  const pending = Number(balance.pending_amount || 0)
  const available = Number(balance.available_amount || 0)
  const lifetime = Number(balance.lifetime_earned || 0)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="mb-8">
            <h1 className="font-heading text-4xl font-900 text-white uppercase tracking-tight">
              💰 Cashback
            </h1>
            <p className="text-brand-gray mt-2">
              Earn cashback when you buy through Daily.Deals affiliate links.
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="text-xs font-bold uppercase text-yellow-400 mb-2">Pending</div>
              <div className="text-3xl font-900 text-white">${pending.toFixed(2)}</div>
              <div className="text-xs text-brand-gray mt-2">Awaiting retailer confirmation</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-xs font-bold uppercase text-green-400 mb-2">Available</div>
              <div className="text-3xl font-900 text-white">${available.toFixed(2)}</div>
              <div className="text-xs text-brand-gray mt-2">Ready to withdraw at $25+</div>
            </div>

            <div className="bg-gradient-to-br from-brand-red/20 to-red-700/20 border border-brand-red/30 rounded-xl p-6">
              <div className="text-xs font-bold uppercase text-brand-red mb-2">Lifetime Earned</div>
              <div className="text-3xl font-900 text-white">${lifetime.toFixed(2)}</div>
              <div className="text-xs text-brand-gray mt-2">Total you've earned with us</div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-10">
            <h2 className="font-heading text-xl font-900 text-white uppercase mb-4">How Cashback Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-brand-red font-900 text-2xl mb-2">1</div>
                <div className="text-white font-bold mb-1">Click a deal</div>
                <div className="text-brand-gray">When you click any deal, we track it via your account.</div>
              </div>
              <div>
                <div className="text-brand-red font-900 text-2xl mb-2">2</div>
                <div className="text-white font-bold mb-1">Buy from retailer</div>
                <div className="text-brand-gray">Complete the purchase normally on the retailer's site.</div>
              </div>
              <div>
                <div className="text-brand-red font-900 text-2xl mb-2">3</div>
                <div className="text-white font-bold mb-1">Get paid</div>
                <div className="text-brand-gray">Once the retailer confirms (typically 30–60 days), cashback hits your wallet.</div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-heading text-xl font-900 text-white uppercase mb-4">Recent Activity</h2>
            {events.length === 0 ? (
              <div className="text-center py-12 text-brand-gray">
                <div className="text-5xl mb-3">🛒</div>
                <p>No cashback activity yet. Click a deal to start earning.</p>
                <Link href="/" className="inline-block mt-4 text-brand-red underline">
                  Browse deals →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 bg-black/30 rounded p-3">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ background: e.retailers?.brand_color || '#dc2626', color: 'white' }}
                    >
                      {e.retailers?.name?.[0] || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-bold truncate">
                        {e.deals?.title || 'Deal'}
                      </div>
                      <div className="text-xs text-brand-gray">
                        {e.retailers?.name} · {new Date(e.clicked_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {e.cashback_amount ? (
                        <div className="text-green-400 font-900">${Number(e.cashback_amount).toFixed(2)}</div>
                      ) : (
                        <div className="text-yellow-400 text-xs font-bold">{e.cashback_rate}%</div>
                      )}
                      <div className={`text-[10px] uppercase font-bold ${
                        e.status === 'paid' ? 'text-green-400' :
                        e.status === 'confirmed' ? 'text-blue-400' :
                        e.status === 'rejected' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {e.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
