import Link from 'next/link'
import { CATEGORIES } from '@/lib/utils'

export default function CategoryNav() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="flex items-center gap-1.5 flex-shrink-0 text-sm font-medium text-gray-600 hover:text-brand-orange hover:bg-orange-50 px-3 py-1.5 rounded-full transition-colors">
              <span>{cat.icon}</span><span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
