'use client'
import { useLocation } from '@/hooks/useLocation'

export default function HeroSection({ totalDeals }: { totalDeals: number }) {
  const { location, loading } = useLocation()

  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-5"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="max-w-3xl">
          {/* LOCATION PILL */}
          <div className="inline-flex items-center gap-2 bg-brand-dark-4 border border-white/10
                          rounded-full px-4 py-2 text-sm text-brand-gray-2 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            {loading ? (
              <span>Detecting your location...</span>
            ) : location ? (
              <span>
                Showing deals for <strong className="text-white">{location.city}, {location.stateCode}</strong>
                <span className="ml-1">{location.country === 'CA' ? '🇨🇦' : '🇺🇸'}</span>
              </span>
            ) : (
              <span>Top deals across US & Canada</span>
            )}
          </div>

          {/* HEADLINE */}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-900 text-white
                         uppercase leading-none tracking-tight mb-4 animate-slide-up">
            Today's Best<br />
            <span className="text-brand-red">Deals</span> — Yours.
          </h1>

          <p className="text-brand-gray-2 text-lg max-w-xl mb-8 leading-relaxed animate-fade-in">
            Hand-picked discounts from 1,000+ US & Canadian retailers.
            Updated every 24 hours. Always free.
          </p>

          {/* STATS ROW */}
          <div className="flex flex-wrap gap-3 mb-8 animate-fade-in">
            <div className="stat-pill">
              <span className="text-brand-red font-bold text-base">{totalDeals > 0 ? totalDeals.toLocaleString() : '30+'}</span>
              <span>deals today</span>
            </div>
            <div className="stat-pill">
              <span className="text-brand-gold font-bold text-base">1,000+</span>
              <span>retailers</span>
            </div>
            <div className="stat-pill">
              <span className="text-brand-green font-bold text-base">Up to 70%</span>
              <span>off today</span>
            </div>
            <div className="stat-pill">
              <span className="text-brand-blue font-bold text-base">US & CA</span>
              <span>coverage</span>
            </div>
          </div>

          {/* CATEGORY QUICK LINKS */}
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {['Electronics 💻', 'Fashion 👗', 'Home 🏠', 'Sports ⚽', 'Beauty 💄', 'Gaming 🎮'].map(cat => (
              <span key={cat}
                className="bg-brand-dark-4 border border-white/10 hover:border-brand-red/40
                           text-brand-gray-2 hover:text-white text-xs font-medium
                           px-3 py-1.5 rounded-full cursor-pointer transition-all">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DECORATIVE ELEMENTS */}
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none hidden lg:block"
           style={{ background: 'radial-gradient(circle at 80% 50%, #E8222A, transparent 60%)' }} />
    </section>
  )
}
