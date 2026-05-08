import Link from 'next/link'
import { Retailer } from '@/types'

export default function StoreGrid({ retailers }: { retailers: Retailer[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {retailers.map(r => (
        <Link key={r.id} href={`/store/${r.slug}`}
          className="flex flex-col items-center justify-center gap-2.5 p-4
                     bg-brand-dark-3 border border-white/8 rounded-xl
                     hover:border-brand-red/40 hover:bg-brand-dark-4
                     transition-all duration-150 group">

          {/* LOGO CIRCLE */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center
                          text-white text-lg font-black shadow-card flex-shrink-0"
               style={{ backgroundColor: r.brand_color || '#333' }}>
            {r.name.charAt(0)}
          </div>

          {/* NAME */}
          <span className="text-xs font-medium text-brand-gray-2 text-center
                           group-hover:text-white transition-colors line-clamp-1 w-full">
            {r.name}
          </span>

          {/* FLAG */}
          <span className="text-xs">
            {r.country === 'CA' ? '🇨🇦' : r.country === 'US' ? '🇺🇸' : '🌎'}
          </span>
        </Link>
      ))}
    </div>
  )
}
