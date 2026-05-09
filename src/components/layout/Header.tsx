'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { CATEGORIES } from '@/lib/utils'
import SearchBar from '@/components/ui/SearchBar'

export default function Header() {
  const { location, loading, error, setManualLocation } = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(j => setUser(j.user)).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const ok = await setManualLocation(input)
    if (ok) { setShowModal(false); setInput('') }
    setSaving(false)
  }

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
    setShowAccountMenu(false)
    window.location.reload()
  }

  return (
    <>
      <div className="bg-brand-red text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase">
        🔥 New deals added every 24 hours — US & Canada
      </div>

      <header className="sticky top-0 z-50 bg-brand-dark-2/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

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

            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2 ml-auto">
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

              <button className="md:hidden bg-brand-dark-4 border border-white/10 p-2 rounded-lg text-brand-gray-2">
                🔍
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="hidden sm:flex items-center gap-1.5 bg-brand-dark-4 hover:bg-brand-dark-5
                               border border-white/10 hover:border-brand-red/40
                               px-3 py-2 rounded-lg text-xs font-medium text-white transition-all"
                  >
                    <span>👤</span>
                    <span className="max-w-[80px] truncate">{user.username || user.email.split('@')[0]}</span>
                    <span className="text-brand-gray text-[10px]">▼</span>
                  </button>

                  {showAccountMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-brand-dark-3 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                        <Link href="/account" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-white hover:bg-white/5 border-b border-white/5">
                          👤 My Account
                        </Link>
                        <Link href="/cashback" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-white hover:bg-white/5 border-b border-white/5">
                          💰 Cashback Wallet
                        </Link>
                        <Link href="/account#saves" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-white hover:bg-white/5 border-b border-white/5">
                          🔖 Saved Deals
                        </Link>
                        <Link href="/account#alerts" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-white hover:bg-white/5 border-b border-white/5">
                          🔔 Deal Alerts
                        </Link>
                        <Link href="/extension" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-white hover:bg-white/5 border-b border-white/5">
                          🧩 Browser Extension
                        </Link>
                        {user.is_admin && (
                          <>
                            <Link href="/admin/scout" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-yellow-400 hover:bg-white/5 border-b border-white/5">
                              🤖 AI Scout (Admin)
                            </Link>
                            <Link href="/admin/moderation" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-yellow-400 hover:bg-white/5 border-b border-white/5">
                              🛡️ Moderation (Admin)
                            </Link>
                          </>
                        )}
                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-3 text-sm text-brand-red hover:bg-white/5">
                          🚪 Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/signin"
                  className="hidden sm:inline-flex text-xs font-bold text-brand-gray-2 hover:text-white px-3 py-2 transition-colors">
                  Sign In
                </Link>
              )}

              <Link href="/deals/hot" className="btn-primary hidden sm:inline-flex">
                🔥 Hot Deals
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 bg-brand-dark-2">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
              <Link href="/deals/hot"
                className="flex-shrink-0 text-xs font-bold text-brand-red uppercase tracking-wider
                           bg-brand-red/10 border border-brand-red/20 px-3 py-1.5 rounded-md
                           hover:bg-brand-red/20 transition-colors">
                🔥 Hot Deals
              </Link>
              <Link href="/for-you"
                className="flex-shrink-0 text-xs font-bold uppercase tracking-wider
                           bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-fuchsia-300
                           border border-fuchsia-500/30 px-3 py-1.5 rounded-md
                           hover:from-purple-500/30 hover:to-fuchsia-500/30 transition-colors">
                ✨ For You
              </Link>
              <Link href="/cashback"
                className="flex-shrink-0 text-xs font-bold uppercase tracking-wider
                           bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-amber-300
                           border border-amber-500/30 px-3 py-1.5 rounded-md
                           hover:from-yellow-500/30 hover:to-amber-500/30 transition-colors">
                💰 Cashback
              </Link>
              <Link href="/deals/today"
                className="flex-shrink-0 text-xs font-bold text-white uppercase tracking-wider
                           bg-white/5 border border-white/10 px-3 py-1.5 rounded-md
                           hover:bg-white/10 transition-colors">
                Today
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
              <Link href="/extension"
                className="flex-shrink-0 text-xs font-medium text-brand-gray-2 uppercase tracking-wider
                           px-3 py-1.5 rounded-md hover:text-white hover:bg-white/8 transition-colors">
                🧩 Extension
              </Link>
            </div>
          </div>
        </div>
      </header>

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
