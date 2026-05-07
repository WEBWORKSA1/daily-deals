'use client'
import { useLocation } from '@/hooks/useLocation'

export default function HeroSection({ totalDeals }: { totalDeals: number }) {
  const { location, loading } = useLocation()
  return (
    <section className="bg-brand-navy text-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/30 rounded-full px-4 py-1.5 text-sm text-brand-orange font-medium mb-6">
          🔥 {totalDeals.toLocaleString()} deals updated today
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          Best Daily Deals<br /><span className="text-brand-orange">Near You</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-6">
          {loading ? 'Personalizing deals for your location...' : location ? `Showing deals for ${location.city}, ${location.stateProvince} ${location.country === 'CA' ? '🇨🇦' : '🇺🇸'}` : 'Top deals from 1,000+ US & Canadian retailers — updated every 24 hours'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400">
          <span>✅ 1,000+ retailers</span><span>✅ Updated daily</span><span>✅ US & Canada</span><span>✅ Free to use</span>
        </div>
      </div>
    </section>
  )
}
