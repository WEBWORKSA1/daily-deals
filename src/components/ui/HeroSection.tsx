'use client'
import { useLocation } from '@/hooks/useLocation'
import Link from 'next/link'

export default function HeroSection({ totalDeals }: { totalDeals: number }) {
  const { location, loading } = useLocation()

  return (
    <section className="relative overflow-hidden bg-brand-dark">
      {/* GRID PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

      {/* RED GLOW */}
      <div className="absolute -left-40 top-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,34,42,0.2) 0%, transparent 70%)' }} />
      <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)' }} />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — COPY */}
          <div>
            {/* LOCATION BADGE */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10
                            rounded-full px-4 py-2 text-xs text-brand-gray-2 mb-6">
              <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse flex-shrink-0" />
              {loading ? 'Detecting location...' : location
                ? <span>Deals for <strong className="text-white">{location.city}, {location.stateCode}</strong> {location.country === 'CA' ? '🇨🇦' : '🇺🇸'}</span>
                : <span>US & Canada deals — updated daily</span>
              }
            </div>

            {/* HEADLINE */}
            <h1 className="font-heading font-900 uppercase leading-none tracking-tight mb-6">
              <span className="block text-6xl sm:text-7xl lg:text-8xl text-white">The Best</span>
              <span className="block text-6xl sm:text-7xl lg:text-8xl text-brand-red">Deals.</span>
              <span className="block text-6xl sm:text-7xl lg:text-8xl text-white">Daily.</span>
            </h1>

            <p className="text-brand-gray-2 text-lg leading-relaxed mb-8 max-w-lg">
              Handpicked discounts from 1,000+ retailers across the US and Canada.
              Updated every 24 hours. Always free.
            </p>

            {/* STATS ROW */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span className="text-brand-red font-black text-lg">{totalDeals > 0 ? totalDeals : '40'}+</span>
                <span className="text-brand-gray text-xs">deals today</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span className="text-brand-gold font-black text-lg">1,000+</span>
                <span className="text-brand-gray text-xs">retailers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span className="text-brand-green font-black text-lg">Up to 70%</span>
                <span className="text-brand-gray text-xs">off</span>
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <Link href="/deals/today" className="btn-primary px-8 py-4 text-base">
                Browse Deals →
              </Link>
              <Link href="/deals/flash"
                className="flex items-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20
                           border border-brand-gold/30 text-brand-gold font-bold
                           px-6 py-4 rounded-lg transition-all text-sm uppercase tracking-wider">
                ⚡ Flash Deals
              </Link>
            </div>
          </div>

          {/* RIGHT — CATEGORY GRID */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {[
              { icon: '💻', label: 'Electronics', slug: 'electronics', color: '#3B82F6' },
              { icon: '👗', label: 'Fashion', slug: 'fashion', color: '#EC4899' },
              { icon: '🏠', label: 'Home', slug: 'home-kitchen', color: '#F59E0B' },
              { icon: '⚽', label: 'Sports', slug: 'sports-outdoors', color: '#22C55E' },
              { icon: '💄', label: 'Beauty', slug: 'beauty', color: '#A855F7' },
              { icon: '🎮', label: 'Gaming', slug: 'gaming', color: '#E8222A' },
            ].map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="flex items-center gap-3 bg-brand-dark-3 border border-white/10
                           hover:border-white/25 rounded-xl p-4 group transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: cat.color + '20', border: `1px solid ${cat.color}30` }}>
                  {cat.icon}
                </div>
                <span className="text-brand-gray-2 group-hover:text-white text-sm font-medium transition-colors">
                  {cat.label}
                </span>
                <span className="ml-auto text-brand-gray text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
