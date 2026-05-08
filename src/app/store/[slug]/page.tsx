import { Metadata } from 'next'
import { supabase } from '@/lib/db'
import { Deal, Retailer } from '@/types'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealSection from '@/components/ui/DealSection'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: retailer } = await supabase.from('retailers').select('*').eq('slug', params.slug).single()
  if (!retailer) return { title: 'Store Not Found' }
  return { title: `${retailer.name} Deals Today | Daily.Deals`, description: `Best ${retailer.name} deals and discounts today.` }
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

  return (
    <>
      <Header />
      <main>
        {/* STORE HERO */}
        <div className="bg-brand-dark-2 border-b border-white/10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-card flex-shrink-0"
                   style={{ backgroundColor: retailer.brand_color || '#333' }}>
                {retailer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Store</span>
                  <span className="text-xs">{retailer.country === 'CA' ? '🇨🇦' : retailer.country === 'US' ? '🇺🇸' : '🌎'}</span>
                </div>
                <h1 className="font-heading text-4xl font-900 text-white uppercase">{retailer.name} Deals</h1>
                <p className="text-brand-gray text-sm mt-1">{dealList.length} deals available today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {dealList.length > 0 ? (
            <DealSection title={`${retailer.name} Deals Today`} deals={dealList} />
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-30">🏪</div>
              <h2 className="font-heading text-2xl text-white uppercase mb-2">No Deals Right Now</h2>
              <p className="text-brand-gray">Check back soon — we update deals every 24 hours.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
