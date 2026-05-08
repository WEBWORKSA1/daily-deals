import { Metadata } from 'next'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'All Stores | Daily.Deals' }

export default async function StoresPage() {
  const { data: retailers } = await supabase
    .from('retailers').select('*').eq('is_active', true).order('name')

  const usStores = (retailers || []).filter(r => r.country === 'US' || r.country === 'BOTH')
  const caStores = (retailers || []).filter(r => r.country === 'CA' || r.country === 'BOTH')

  return (
    <>
      <Header />
      <main>
        <div className="bg-brand-dark-2 border-b border-white/10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Browse</span>
            <h1 className="font-heading text-5xl font-900 text-white uppercase mt-1">All Stores</h1>
            <p className="text-brand-gray text-sm mt-2">{retailers?.length || 0} retailers across US & Canada</p>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

          {/* US STORES */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-brand-red" />
              <h2 className="font-heading text-2xl font-900 text-white uppercase">🇺🇸 US Retailers</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {usStores.map(r => (
                <Link key={r.id} href={`/store/${r.slug}`}
                  className="flex flex-col items-center gap-3 p-5 bg-brand-dark-3
                             border border-white/10 rounded-xl hover:border-brand-red/40
                             hover:bg-brand-dark-4 transition-all group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                                  text-white text-2xl font-black"
                    style={{ backgroundColor: r.brand_color || '#333' }}>
                    {r.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <div className="text-white text-sm font-semibold group-hover:text-brand-red
                                    transition-colors line-clamp-1">{r.name}</div>
                    <div className="text-brand-gray text-xs mt-0.5">{r.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* CANADIAN STORES */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-brand-red" />
              <h2 className="font-heading text-2xl font-900 text-white uppercase">🇨🇦 Canadian Retailers</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {caStores.map(r => (
                <Link key={r.id} href={`/store/${r.slug}`}
                  className="flex flex-col items-center gap-3 p-5 bg-brand-dark-3
                             border border-white/10 rounded-xl hover:border-brand-red/40
                             hover:bg-brand-dark-4 transition-all group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                                  text-white text-2xl font-black"
                    style={{ backgroundColor: r.brand_color || '#333' }}>
                    {r.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <div className="text-white text-sm font-semibold group-hover:text-brand-red
                                    transition-colors line-clamp-1">{r.name}</div>
                    <div className="text-brand-gray text-xs mt-0.5">{r.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
