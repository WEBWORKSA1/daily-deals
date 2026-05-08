import { Metadata } from 'next'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealSection from '@/components/ui/DealSection'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Clearance Deals | Daily.Deals' }

export default async function ClearancePage() {
  const { data: deals } = await supabase
    .from('deals').select('*, retailers(name, slug, brand_color, affiliate_net)')
    .eq('is_active', true).eq('deal_type', 'clearance')
    .order('discount_percent', { ascending: false }).limit(60)

  const dealList = (deals || []).map((d: any) => ({
    ...d, retailer_name: d.retailers?.name, retailer_slug: d.retailers?.slug, retailer_brand_color: d.retailers?.brand_color,
  }))

  return (
    <>
      <Header />
      <main>
        <div className="bg-brand-dark-2 border-b border-brand-blue/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <span className="text-brand-blue text-xs font-bold uppercase tracking-widest">Clearance</span>
            <h1 className="font-heading text-5xl font-900 text-white uppercase mt-1">Clearance Deals</h1>
            <p className="text-brand-gray text-sm mt-2">{dealList.length} clearance deals — massive discounts</p>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {dealList.length > 0 ? (
            <DealSection title="Clearance Deals" deals={dealList} />
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-30">🏷️</div>
              <h2 className="font-heading text-2xl text-white uppercase mb-2">No Clearance Deals Right Now</h2>
              <p className="text-brand-gray">Check back soon — we update deals every 24 hours.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
