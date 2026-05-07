import Link from 'next/link'
import { Retailer } from '@/types'

export default function StoreGrid({ retailers }: { retailers: Retailer[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {retailers.map(r => (
        <Link key={r.id} href={`/store/${r.slug}`} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-orange/40 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: r.brand_color || '#0A1628' }}>{r.name.charAt(0)}</div>
          <span className="text-xs font-medium text-gray-700 text-center group-hover:text-brand-orange transition-colors line-clamp-1">{r.name}</span>
          <span className="text-xs text-gray-400">{r.country === 'CA' ? '🇨🇦' : r.country === 'US' ? '🇺🇸' : '🌎'}</span>
        </Link>
      ))}
    </div>
  )
}
