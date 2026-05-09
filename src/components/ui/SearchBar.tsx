'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface AutocompleteResult {
  query: string
  deals: any[]
  retailers: any[]
  categories: string[]
}

export default function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<AutocompleteResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const wrapRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q.trim())}`)
        const json = await res.json()
        setResults(json)
        setShowDropdown(true)
      } catch {} finally { setLoading(false) }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    setShowDropdown(false)
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const hasResults = results && (results.deals.length || results.retailers.length || results.categories.length)

  return (
    <div className="relative w-full" ref={wrapRef}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => results && setShowDropdown(true)}
          placeholder="Search deals, stores, brands..."
          className="input-dark pl-11 pr-4 h-10"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray text-base pointer-events-none">
          {loading ? '⏳' : '🔍'}
        </span>
      </form>

      {/* DROPDOWN */}
      {showDropdown && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-dark-3 border border-white/10
                        rounded-xl shadow-card z-50 max-h-[480px] overflow-y-auto">

          {/* CATEGORIES */}
          {results!.categories.length > 0 && (
            <div className="px-3 py-2 border-b border-white/5">
              <div className="text-brand-gray text-[10px] uppercase tracking-wider font-bold mb-1.5">
                Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results!.categories.map(cat => (
                  <Link key={cat} href={`/category/${cat.toLowerCase()}`}
                    className="text-xs bg-brand-red/10 text-brand-red border border-brand-red/20
                               px-2 py-1 rounded-md hover:bg-brand-red/20"
                    onClick={() => setShowDropdown(false)}>
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* RETAILERS */}
          {results!.retailers.length > 0 && (
            <div className="px-3 py-2 border-b border-white/5">
              <div className="text-brand-gray text-[10px] uppercase tracking-wider font-bold mb-1.5">
                Stores
              </div>
              {results!.retailers.map((r: any) => (
                <Link key={r.id} href={`/store/${r.slug}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}>
                  <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-xs"
                       style={{ color: r.brand_color }}>
                    {r.logo_url ? (
                      <img src={r.logo_url} alt={r.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="font-bold">{r.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-sm text-white">{r.name}</span>
                  <span className="text-xs ml-auto">{r.country === 'CA' ? '🇨🇦' : '🇺🇸'}</span>
                </Link>
              ))}
            </div>
          )}

          {/* DEALS */}
          {results!.deals.length > 0 && (
            <div className="px-3 py-2">
              <div className="text-brand-gray text-[10px] uppercase tracking-wider font-bold mb-1.5">
                Deals
              </div>
              {results!.deals.map((d: any) => (
                <Link key={d.id} href={`/deal/${d.id}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}>
                  <div className="w-10 h-10 rounded bg-brand-dark-4 flex-shrink-0 overflow-hidden">
                    {d.image_url ? (
                      <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base">🛍️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white line-clamp-1">{d.title}</div>
                    <div className="flex items-center gap-2 text-[10px] mt-0.5">
                      <span className="text-brand-red font-bold">${d.deal_price}</span>
                      {d.discount_percent && (
                        <span className="text-brand-green">-{d.discount_percent}%</span>
                      )}
                      {d.retailer_name && (
                        <span className="text-brand-gray">{d.retailer_name}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <button type="button" onClick={handleSubmit}
                className="w-full mt-1 text-xs text-brand-red text-center py-1.5 hover:bg-white/5 rounded-md">
                See all results for "{q}" →
              </button>
            </div>
          )}
        </div>
      )}

      {/* NO RESULTS */}
      {showDropdown && results && !hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-dark-3 border border-white/10
                        rounded-xl shadow-card z-50 px-4 py-6 text-center">
          <div className="text-brand-gray text-sm">No matches for "{q}"</div>
          <div className="text-brand-gray text-xs mt-1">Try a different search term</div>
        </div>
      )}
    </div>
  )
}
