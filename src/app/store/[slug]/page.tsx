import { Metadata } from 'next'
import { supabase } from '@/lib/db'
import { Deal, Retailer } from '@/types'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealSection from '@/components/ui/DealSection'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: retailer } = await supabase.from('retailers').select('*').eq('slug', params.slug).single()
  if (!retailer) return { title: 'Store Not Found' }
  return {
    title: `${retailer.name} Deals Today | Daily.Deals`,
    description: `Find the best ${retailer.name} deals, discounts and coupons today.`,
  }
}

export default async function StorePage({ params }: Props) {
  const { data: retailer } = await supabase.from('retailers').select('*').eq('slug', params.slug).single()
  if (!retailer) notFound()

  const { data: deals } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color, affiliate_net)')
    .eq('is_active', true)
    .eq('retailer_id', retailer.id)
    .order('discount_percent', { ascending: false })
    .limit(40)

  const dealList = (deals || []).map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
    retailer_brand_color: d.retailers?.brand_color,
  }))

  // Get stats
  const flashCount = dealList.filter(d => d.deal_type === 'flash').length
  const clearanceCount = dealList.filter(d => d.deal_type === 'clearance').length
  const maxDiscount = dealList.length ? Math.max(...dealList.map(d => d.discount_percent || 0)) : 0

  return (
    <>
      <Header />
      <main>
        {/* STORE HERO */}
        <div className="relative bg-brand-dark-2 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 0% 50%, ${retailer.brand_color || '#E8222A'}15, transparent 60%)` }} />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start gap-6">
              {/* LOGO */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                              text-white text-3xl font-black shadow-card flex-shrink-0"
                style={{ backgroundColor: retailer.brand_color || '#333' }}>
                {retailer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href="/stores" className="text-brand-gray text-xs hover:text-white transition-colors">Stores</Link>
                  <span className="text-brand-gray text-xs">→</span>
                  <span className="text-brand-gray-2 text-xs">{retailer.name}</span>
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl font-900 text-white uppercase mb-1">
                  {retailer.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs">{retailer.country === 'CA' ? '🇨🇦 Canada' : retailer.country === 'US' ? '🇺🇸 United States' : '🌎 US & Canada'}</span>
                  <span className="text-brand-gray text-xs">•</span>
                  <span className="text-brand-gray text-xs">{retailer.category}</span>
                </div>

                {/* QUICK STATS */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="bg-brand-dark-4 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-white font-bold">{dealList.length}</span>
                    <span className="text-brand-gray ml-1">deals today</span>
                  </div>
                  {maxDiscount > 0 && (
                    <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-brand-red font-bold">Up to -{maxDiscount}%</span>
                    </div>
                  )}
                  {flashCount > 0 && (
                    <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-brand-gold font-bold">{flashCount}</span>
                      <span className="text-brand-gray ml-1">flash deals</span>
                    </div>
                  )}
                  {clearanceCount > 0 && (
                    <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-3 py-1.5 text-xs">
                      <span className="text-brand-blue font-bold">{clearanceCount}</span>
                      <span className="text-brand-gray ml-1">clearance</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {dealList.length > 0 ? (
            <DealSection title={`${retailer.name} Deals`} deals={dealList} />
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-30">🏪</div>
              <h2 className="font-heading text-2xl text-white uppercase mb-2">No Deals Right Now</h2>
              <p className="text-brand-gray text-sm mb-6">Check back soon — we update deals every 24 hours.</p>
              <Link href="/" className="btn-primary">Browse All Deals →</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
