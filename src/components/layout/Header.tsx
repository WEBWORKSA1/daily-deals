'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { CATEGORIES } from '@/lib/utils'

export default function Header() {
  const { location, loading, error, setManualLocation } = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const ok = await setManualLocation(input)
    if (ok) { setShowModal(false); setInput('') }
    setSaving(false)
  }

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-brand-red text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase">
        🔥 New deals added every 24 hours — US & Canada
      </div>

      {/* MAIN HEADER */}
      <header className="sticky top-0 z-50 bg-brand-dark-2/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="relative">
                <span className="text-brand-red text-2xl fire-icon">🔥</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-2xl font-900 text-white tracking-tight">
                  DAILY<span className="text-brand-red">.</span>DEALS
                </span>
                <span className="text-brand-gray text-xs tracking-widest uppercase">US & Canada</span>
              </div>
            </Link>

            {/* SEARCH BAR */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search deals, stores, brands..."
                  className="input-dark pl-11 pr-4 h-10"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray text-base">🔍</span>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 ml-auto">

              {/* LOCATION */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 bg-brand-dark-4 hover:bg-brand-dark-5
                           border border-white/10 hover:border-brand-red/40
                           px-3 py-2 rounded-lg text-sm transition-all group"
              >
                <span className="text-brand-red">📍</span>
                <span className="text-brand-gray-2 group-hover:text-white transition-colors max-w-[120px] truncate text-xs font-medium">
                  {loading ? 'Detecting...' : location ? `${location.city}, ${location.stateCode}` : 'Set Location'}
                </span>
                {location && (
                  <span className="text-xs">{location.country === 'CA' ? '🇨🇦' : '🇺🇸'}</span>
                )}
              </button>

              {/* MOBILE SEARCH */}
              <button className="md:hidden bg-brand-dark-4 border border-white/10 p-2 rounded-lg text-brand-gray-2">
                🔍
              </button>

              {/* CTA */}
              <Link href="/deals/today" className="btn-primary hidden sm:inline-flex">
                Today's Deals
              </Link>
            </div>
          </div>
        </div>

        {/* NAV */}
        <div className="border-t border-white/5 bg-brand-dark-2">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
              <Link href="/deals/today"
                className="flex-shrink-0 text-xs font-bold text-brand-red uppercase tracking-wider
                           bg-brand-red/10 border border-brand-red/20 px-3 py-1.5 rounded-md
                           hover:bg-brand-red/20 transition-colors">
                🔥 Hot Deals
              </Link>
              <Link href="/deals/flash"
                className="flex-shrink-0 text-xs font-bold text-brand-gold uppercase tracking-wider
                           bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-md
                           hover:bg-brand-gold/20 transition-colors">
                ⚡ Flash
              </Link>
              {CATEGORIES.map(cat => (
                <Link key={cat.slug} href={`/category/${cat.slug}`}
                  className="flex-shrink-0 text-xs font-medium text-brand-gray-2 uppercase tracking-wider
                             px-3 py-1.5 rounded-md hover:text-white hover:bg-white/8 transition-colors">
                  {cat.icon} {cat.label}
                </Link>
              ))}
              <Link href="/stores"
                className="flex-shrink-0 text-xs font-medium text-brand-gray-2 uppercase tracking-wider
                           px-3 py-1.5 rounded-md hover:text-white hover:bg-white/8 transition-colors ml-2">
                🏪 All Stores
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* LOCATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowModal(false)}>
          <div className="bg-brand-dark-3 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-card"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-red/20 rounded-full flex items-center justify-center">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-white uppercase">Set Your Location</h2>
                <p className="text-brand-gray text-xs">See deals near you</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="ZIP code (US) or Postal code (CA)"
                className="input-dark flex-1" autoFocus />
              <button type="submit" disabled={saving} className="btn-primary px-5">
                {saving ? '...' : 'Go'}
              </button>
            </form>
            {error && <p className="text-brand-red text-xs mb-2">{error}</p>}
            <p className="text-brand-gray text-xs">
              Examples: <span className="text-white">10001</span> (New York) or{' '}
              <span className="text-white">M5V 1A1</span> (Toronto)
            </p>
          </div>
        </div>
      )}
    </>
  )
}
