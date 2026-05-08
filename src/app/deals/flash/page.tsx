import { Metadata } from 'next'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealSection from '@/components/ui/DealSection'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Flash Deals — Limited Time Offers | Daily.Deals' }

export default async function FlashDealsPage() {
  const { data: deals } = await supabase
    .from('deals').select('*, retailers(name, slug, brand_color, affiliate_net)')
    .eq('is_active', true).eq('deal_type', 'flash')
    .order('discount_percent', { ascending: false }).limit(40)

  const dealList = (deals || []).map((d: any) => ({
    ...d, retailer_name: d.retailers?.name, retailer_slug: d.retailers?.slug, retailer_brand_color: d.retailers?.brand_color,
  }))

  return (
    <>
      <Header />
      <main>
        <div className="bg-brand-dark-2 border-b border-brand-gold/20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Limited Time</span>
            <h1 className="font-heading text-5xl font-900 text-white uppercase mt-1">⚡ Flash Deals</h1>
            <p className="text-brand-gray text-sm mt-2">These deals expire soon — grab them while they last</p>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <DealSection title="⚡ Flash Deals" deals={dealList} highlight />
        </div>
      </main>
      <Footer />
    </>
  )
}
