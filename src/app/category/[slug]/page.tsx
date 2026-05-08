import { Metadata } from 'next'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealSection from '@/components/ui/DealSection'
import { CATEGORIES } from '@/lib/utils'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) return { title: 'Category Not Found' }
  return { title: `${cat.label} Deals Today | Daily.Deals`, description: `Best ${cat.label} deals and discounts today.` }
}

export default async function CategoryPage({ params }: Props) {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) notFound()

  const { data: deals } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color, affiliate_net)')
    .eq('is_active', true)
    .ilike('category', `%${cat.label.split(' ')[0]}%`)
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
        <div className="bg-brand-dark-2 border-b border-white/10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-red/15 border border-brand-red/25 rounded-2xl
                              flex items-center justify-center text-3xl">
                {cat.icon}
              </div>
              <div>
                <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Category</span>
                <h1 className="font-heading text-4xl font-900 text-white uppercase">{cat.label} Deals</h1>
                <p className="text-brand-gray text-sm mt-1">{dealList.length} deals available today</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {dealList.length > 0 ? (
            <DealSection title={`${cat.icon} ${cat.label} Deals Today`} deals={dealList} />
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-30">{cat.icon}</div>
              <h2 className="font-heading text-2xl text-white uppercase mb-2">No {cat.label} Deals Right Now</h2>
              <p className="text-brand-gray">Check back soon — we update deals every 24 hours.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
