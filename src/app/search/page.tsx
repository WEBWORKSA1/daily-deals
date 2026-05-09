'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealCard from '@/components/deals/DealCard'
import { Deal } from '@/types'
import { CATEGORIES } from '@/lib/utils'

const SORTS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'hottest',   label: 'Hottest 🔥' },
  { value: 'discount',  label: 'Biggest Discount' },
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
]

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const initialQ = params.get('q') || ''

  const [q, setQ] = useState(initialQ)
  const [results, setResults] = useState<Deal[]>([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)

  // Filters
  const [category, setCategory] = useState(params.get('category') || '')
  const [country, setCountry] = useState(params.get('country') || '')
  const [minDiscount, setMinDiscount] = useState(parseInt(params.get('min_discount') || '0'))
  const [maxPrice, setMaxPrice] = useState(parseFloat(params.get('max_price') || '999999'))
  const [sort, setSort] = useState(params.get('sort') || 'relevance')

  async function runSearch() {
    setLoading(true)
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (category) sp.set('category', category)
    if (country) sp.set('country', country)
    if (minDiscount > 0) sp.set('min_discount', minDiscount.toString())
    if (maxPrice < 999999) sp.set('max_price', maxPrice.toString())
    if (sort) sp.set('sort', sort)
    try {
      const res = await fetch(`/api/search?${sp.toString()}`)
      const json = await res.json()
      setResults(json.deals || [])
      setCount(json.count || 0)
      // Update URL without reload
      router.replace(`/search?${sp.toString()}`, { scroll: false })
    } catch (e) {
      setResults([])
    } finally { setLoading(false) }
  }

  // Run on mount + when filters change
  useEffect(() => { runSearch() }, [category, country, minDiscount, maxPrice, sort])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch()
  }

  function clearFilters() {
    setCategory('')
    setCountry('')
    setMinDiscount(0)
    setMaxPrice(999999)
    setSort('relevance')
  }

  const hasFilters = category || country || minDiscount > 0 || maxPrice < 999999

  return (
    <>
      <Header />
      <main>
        {/* HEADER STRIP */}
        <section className="bg-brand-dark-3 border-b border-white/5 py-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-900 text-white uppercase tracking-tight">
              {q ? `Results for "${q}"` : 'Search Daily Deals'}
            </h1>
            <p className="text-brand-gray text-sm mt-1">
              {loading ? 'Searching...' : `${count} ${count === 1 ? 'deal' : 'deals'} found`}
            </p>

            {/* SEARCH BOX */}
            <form onSubmit={handleSearchSubmit} className="mt-4 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search deals, stores, brands..."
                  className="input-dark pl-11 pr-24 h-12"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray text-base pointer-events-none">🔍</span>
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary h-9 px-4 text-xs">
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* FILTERS SIDEBAR */}
          <aside className="space-y-6">
            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-brand-red text-xs hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {/* SORT */}
              <div className="mb-4">
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">Sort</label>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="input-dark w-full text-sm h-9">
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* COUNTRY */}
              <div className="mb-4">
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">Country</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { value: '',  label: 'All',  emoji: '🌎' },
                    { value: 'US',label: 'US',   emoji: '🇺🇸' },
                    { value: 'CA',label: 'CA',   emoji: '🇨🇦' },
                  ].map(c => (
                    <button key={c.value || 'all'} onClick={() => setCountry(c.value)}
                      className={`text-xs py-2 rounded-md border transition-colors ${
                        country === c.value
                          ? 'bg-brand-red/20 border-brand-red text-brand-red font-bold'
                          : 'bg-white/5 border-white/10 text-brand-gray-2 hover:bg-white/10'
                      }`}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MIN DISCOUNT */}
              <div className="mb-4">
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">
                  Min Discount: {minDiscount}%
                </label>
                <input type="range" min={0} max={90} step={10} value={minDiscount}
                  onChange={e => setMinDiscount(parseInt(e.target.value))}
                  className="w-full" />
                <div className="flex justify-between text-[10px] text-brand-gray mt-1">
                  <span>Any</span><span>90%+</span>
                </div>
              </div>

              {/* MAX PRICE */}
              <div className="mb-4">
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">
                  Max Price: {maxPrice >= 999999 ? 'Any' : `$${maxPrice}`}
                </label>
                <select value={maxPrice} onChange={e => setMaxPrice(parseFloat(e.target.value))}
                  className="input-dark w-full text-sm h-9">
                  <option value={999999}>Any price</option>
                  <option value={25}>Under $25</option>
                  <option value={50}>Under $50</option>
                  <option value={100}>Under $100</option>
                  <option value={250}>Under $250</option>
                  <option value={500}>Under $500</option>
                  <option value={1000}>Under $1000</option>
                </select>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">Category</label>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <button onClick={() => setCategory('')}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                      category === ''
                        ? 'bg-brand-red/10 text-brand-red font-bold'
                        : 'text-brand-gray-2 hover:bg-white/5'
                    }`}>
                    All categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat.slug} onClick={() => setCategory(cat.label)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                        category === cat.label
                          ? 'bg-brand-red/10 text-brand-red font-bold'
                          : 'text-brand-gray-2 hover:bg-white/5'
                      }`}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RESULTS GRID */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-brand-dark-3 border border-white/5 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-12 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-white text-lg font-bold mb-2">No deals match your search</h3>
                <p className="text-brand-gray text-sm mb-4">
                  {q ? `No results for "${q}"` : 'Try adjusting your filters'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map(deal => <DealCard key={deal.id} deal={deal} />)}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
