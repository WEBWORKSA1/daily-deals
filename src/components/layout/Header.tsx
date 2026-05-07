'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'

export default function Header() {
  const { location, loading, error, setManualLocation } = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const ok = await setManualLocation(input)
    if (ok) { setShowModal(false); setInput('') }
    setSaving(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-brand-orange text-2xl">🔥</span>
              <span className="font-heading text-xl font-bold">Daily<span className="text-brand-orange">.</span>Deals</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/deals/today" className="hover:text-brand-orange transition-colors">Deals</Link>
              <Link href="/stores"      className="hover:text-brand-orange transition-colors">Stores</Link>
              <Link href="/categories"  className="hover:text-brand-orange transition-colors">Categories</Link>
              <Link href="/coupons"     className="hover:text-brand-orange transition-colors">Coupons</Link>
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-brand-navy-light hover:bg-white/10 px-3 py-1.5 rounded-full text-sm transition-colors">
                <span>📍</span>
                <span className="max-w-[140px] truncate">{loading ? 'Detecting...' : location ? `${location.city}, ${location.stateCode}` : 'Set location'}</span>
                {location && <span className="text-xs opacity-60">{location.country === 'CA' ? '🇨🇦' : '🇺🇸'}</span>}
              </button>
              <Link href="/search" className="bg-brand-orange hover:bg-brand-orange-light px-3 py-1.5 rounded-full text-sm font-medium transition-colors">🔍 Search</Link>
            </div>
          </div>
        </div>
      </header>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-bold text-brand-navy mb-1">Set your location</h2>
            <p className="text-gray-500 text-sm mb-4">Enter your ZIP (US) or postal code (Canada).</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. 23220 or L3R 1A1"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-orange" autoFocus />
              <button type="submit" disabled={saving} className="btn-primary text-sm px-4 py-2">{saving ? '...' : 'Go'}</button>
            </form>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <p className="text-gray-400 text-xs mt-3 text-center">We never store your exact location.</p>
          </div>
        </div>
      )}
    </>
  )
}
