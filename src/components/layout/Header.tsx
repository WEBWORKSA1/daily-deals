'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocation } from '@/hooks/useLocation'
import { CATEGORIES } from '@/lib/utils'
import SearchBar from '@/components/ui/SearchBar'

function formatToday() {
  const d = new Date()
  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
  return `${days[d.getDay()]} \u00B7 ${months[d.getMonth()]} ${d.getDate()} \u00B7 ${d.getFullYear()}`
}

export default function Header() {
  const { location, loading, error, setManualLocation } = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(formatToday())
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
      {/* DATE STAMP — editorial spine */}
      <div className="bg-white border-b border-rule">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] text-ink-muted">{today || '\u00A0'}</span>
          <span className="text-[11px] tracking-[0.15em] text-ink-muted">DAILY EDITION \u2014 US &amp; CANADA</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-16">

            {/* WORDMARK */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="wordmark text-2xl text-ink">
                Daily<span className="dot">.</span>Deals
              </span>
            </Link>

            {/* SEARCH */}
            <div className="flex-1 max-w-xl hidden md:block">
              <SearchBar />
            </div>

            {/* RIGHT CLUSTER */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-ink-2 hover:text-ink
                           text-xs font-medium transition-colors"
              >
                <span aria-hidden>\u25CE</span>
                <span className="max-w-[140px] truncate">
                  {loading ? 'Detecting\u2026' : location ? `${location.city}, ${location.stateCode}` : 'Set your location'}
                </span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="hidden sm:flex items-center gap-1.5 text-ink-2 hover:text-ink
                               text-xs font-medium transition-colors"
                  >
                    <span className="max-w-[100px] truncate">{user.username || user.email.split('@')[0]}</span>
                    <span aria-hidden className="text-[10px]">\u25BE</span>
                  </button>

                  {showAccountMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-rule shadow-card-hover z-50 overflow-hidden">
                        <Link href="/account" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-ink hover:bg-paper-2 border-b border-rule">My Account</Link>
                        <Link href="/cashback" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-ink hover:bg-paper-2 border-b border-rule">Cashback Wallet</Link>
                        <Link href="/account#saves" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-ink hover:bg-paper-2 border-b border-rule">Saved Deals</Link>
                        <Link href="/account#alerts" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-ink hover:bg-paper-2 border-b border-rule">Deal Alerts</Link>
                        <Link href="/extension" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-ink hover:bg-paper-2 border-b border-rule">Browser Extension</Link>
                        {user.is_admin && (
                          <>
                            <Link href="/admin/scout" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-accent hover:bg-paper-2 border-b border-rule">AI Scout (Admin)</Link>
                            <Link href="/admin/moderation" onClick={() => setShowAccountMenu(false)} className="block px-4 py-3 text-sm text-accent hover:bg-paper-2 border-b border-rule">Moderation (Admin)</Link>
                          </>
                        )}
                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-3 text-sm text-accent hover:bg-paper-2">Sign Out</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/signin" className="hidden sm:inline text-xs font-medium text-ink-2 hover:text-ink">
                  Sign in
                </Link>
              )}

              <Link href="/deals/hot" className="btn-primary hidden sm:inline-flex">
                Browse deals \u2192
              </Link>
            </div>
          </div>
        </div>

        {/* CATEGORY PILLS — editorial chip strip */}
        <div className="border-t border-rule bg-white">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-5 overflow-x-auto py-2.5 scrollbar-hide text-[12px]">
              <Link href="/deals/hot" className="flex-shrink-0 font-medium text-ink whitespace-nowrap">Daily Hot</Link>
              <Link href="/deals/flash" className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">Daily Flash</Link>
              <Link href="/deals/clearance" className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">Daily Clearance</Link>
              <Link href="/for-you" className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">For You</Link>
              <Link href="/cashback" className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">Cashback</Link>
              <span className="flex-shrink-0 text-rule" aria-hidden>|</span>
              {CATEGORIES.map(cat => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">
                  {cat.label}
                </Link>
              ))}
              <span className="flex-shrink-0 text-rule" aria-hidden>|</span>
              <Link href="/stores" className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">All Stores</Link>
              <Link href="/extension" className="flex-shrink-0 text-ink-2 hover:text-ink whitespace-nowrap">Extension</Link>
            </div>
          </div>
        </div>
      </header>

      {/* LOCATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowModal(false)}>
          <div className="bg-white border border-ink p-7 w-full max-w-md"
               onClick={e => e.stopPropagation()}>
            <div className="badge-eyebrow mb-3">SET YOUR LOCATION</div>
            <h2 className="font-serif text-2xl text-ink mb-2">See deals near you.</h2>
            <p className="text-ink-2 text-sm mb-5">We cover 43,140 ZIPs and FSAs across the US and Canada.</p>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="ZIP code or postal code"
                className="input-paper flex-1" autoFocus />
              <button type="submit" disabled={saving} className="btn-primary px-5">
                {saving ? '\u2026' : 'Go'}
              </button>
            </form>
            {error && <p className="text-accent text-xs mb-2">{error}</p>}
            <p className="text-ink-muted text-xs">
              Examples: <span className="text-ink">10001</span> (New York) or{' '}
              <span className="text-ink">M5V 1A1</span> (Toronto)
            </p>
          </div>
        </div>
      )}
    </>
  )
}
