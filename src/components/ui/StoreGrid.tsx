import Link from 'next/link'
import { Retailer } from '@/types'

const STORE_LOGOS: Record<string, string> = {
  'amazon':        'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'walmart':       'https://upload.wikimedia.org/wikipedia/commons/1/14/Walmart_Spark.svg',
  'target':        'https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg',
  'best-buy':      'https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg',
  'home-depot':    'https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg',
  'nike':          'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  'amazon-ca':     'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'walmart-ca':    'https://upload.wikimedia.org/wikipedia/commons/1/14/Walmart_Spark.svg',
  'best-buy-ca':   'https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg',
  'home-depot-ca': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg',
}

export default function StoreGrid({ retailers }: { retailers: Retailer[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {retailers.map(r => (
        <Link key={r.id} href={`/store/${r.slug}`}
          className="flex flex-col items-center justify-center gap-2.5 p-4
                     bg-brand-dark-3 border border-white/10 rounded-xl
                     hover:border-brand-red/40 hover:bg-brand-dark-4
                     transition-all duration-150 group">

          {/* LOGO or LETTER */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center
                          overflow-hidden flex-shrink-0"
               style={{ backgroundColor: r.brand_color || '#333' }}>
            {STORE_LOGOS[r.slug] ? (
              <img
                src={STORE_LOGOS[r.slug]}
                alt={r.name}
                className="w-8 h-8 object-contain filter brightness-0 invert"
              />
            ) : (
              <span className="text-white text-lg font-black">
                {r.name.charAt(0)}
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-brand-gray-2 text-center
                           group-hover:text-white transition-colors line-clamp-1 w-full text-center">
            {r.name}
          </span>

          <span className="text-xs">
            {r.country === 'CA' ? '🇨🇦' : r.country === 'US' ? '🇺🇸' : '🌎'}
          </span>
        </Link>
      ))}
    </div>
  )
}
