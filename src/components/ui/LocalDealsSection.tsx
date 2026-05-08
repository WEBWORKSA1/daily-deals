'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { Deal } from '@/types'
import DealCard from '@/components/deals/DealCard'
import LocationModal from './LocationModal'

interface LocalDealsResponse {
  local: Deal[]
  nearby: Deal[]
  national: Deal[]
}

export default function LocalDealsSection() {
  const { location, loading: locLoading } = useLocation()
  const [data, setData] = useState<LocalDealsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (locLoading) return
    fetchDeals()
  }, [location, locLoading])

  async function fetchDeals() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (location?.latitude && location?.longitude) {
        params.set('lat', String(location.latitude))
        params.set('lng', String(location.longitude))
      }
      if (location?.country) params.set('country', location.country)
      const res = await fetch(`/api/deals/local?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } catch {} finally { setLoading(false) }
  }

  const hasLocation = !!location?.latitude
  const showFullPrompt = !location || !hasLocation
  const totalDealCount = (data?.local.length || 0) + (data?.nearby.length || 0) + (data?.national.length || 0)

  return (
    <section>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-brand-red" />
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-900 text-white uppercase tracking-tight">
              📍 Daily Local Deals
            </h2>
            {hasLocation && location ? (
              <p className="text-brand-gray text-xs mt-0.5">
                Deals for <span className="text-white font-semibold">{location.city}, {location.stateCode}</span>
                {location.country === 'CA' ? ' 🇨🇦' : ' 🇺🇸'}
                {location.isDetected && ' · auto-detected'}
              </p>
            ) : (
              <p className="text-brand-gray text-xs mt-0.5">Set your location for daily local deals</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-brand-red border border-brand-red/30 hover:border-brand-red
                     hover:bg-brand-red hover:text-white text-xs font-bold
                     uppercase tracking-wider transition-all px-3 py-1.5 rounded-lg flex-shrink-0"
        >
          {hasLocation ? 'Change Location' : 'Set Location'} →
        </button>
      </div>

      {/* PROMPT (when no location) */}
      {showFullPrompt && (
        <div className="bg-brand-dark-3 border-2 border-dashed border-white/15 rounded-2xl p-8 mb-6 text-center">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="font-heading text-xl font-900 text-white uppercase tracking-tight mb-2">
            Set Your Location for Daily Local Deals
          </h3>
          <p className="text-brand-gray text-sm mb-5 max-w-md mx-auto">
            Enter your ZIP code (US) or postal code (Canada) to see daily deals from retailers near you.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-8 py-3"
          >
            Set Location →
          </button>
          <div className="text-brand-gray text-xs mt-4">
            Examples: <span className="text-brand-gray-2">M5V 1A1 (Toronto) · L6E 0A1 (Markham) · 10001 (NYC) · 90001 (LA)</span>
          </div>
        </div>
      )}

      {/* TIERS */}
      {loading ? (
        <div className="text-brand-gray text-sm text-center py-12">Loading local deals…</div>
      ) : (
        <div className="space-y-8">
          {/* TIER 1: LOCAL ≤5km */}
          {data && data.local.length > 0 && (
            <div>
              <TierLabel color="green" label={`Local — within 5km of ${location?.city || 'you'}`} count={data.local.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.local.map(deal => <DealCard key={deal.id} deal={deal} />)}
              </div>
            </div>
          )}

          {/* TIER 2: NEARBY 5-50km */}
          {data && data.nearby.length > 0 && (
            <div>
              <TierLabel color="blue" label="Nearby — within 50km" count={data.nearby.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.nearby.map(deal => <DealCard key={deal.id} deal={deal} />)}
              </div>
            </div>
          )}

          {/* TIER 3: NATIONAL ONLINE */}
          {data && data.national.length > 0 && (
            <div>
              <TierLabel color="gray" label="National online — ships to your area" count={data.national.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.national.map(deal => <DealCard key={deal.id} deal={deal} />)}
              </div>
            </div>
          )}

          {/* EMPTY STATE — has location but zero deals */}
          {data && totalDealCount === 0 && (
            <div className="bg-brand-dark-3 border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-3xl mb-3 opacity-30">🗺️</div>
              <p className="text-brand-gray text-sm">
                No deals tagged for this location yet — check back soon as we expand coverage.
              </p>
            </div>
          )}
        </div>
      )}

      <LocationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  )
}

function TierLabel({ color, label, count }: { color: 'green' | 'blue' | 'gray', label: string, count: number }) {
  const dotColor = color === 'green' ? 'bg-brand-green' : color === 'blue' ? 'bg-brand-blue' : 'bg-brand-gray'
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-brand-gray-2 text-xs font-bold uppercase tracking-widest">{label}</span>
      <span className="text-brand-gray text-xs">· {count}</span>
    </div>
  )
}
