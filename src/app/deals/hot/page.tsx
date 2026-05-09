import { Metadata } from 'next'
import { Deal } from '@/types'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealCard from '@/components/deals/DealCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '🔥 Hot Deals Today — Daily.Deals',
  description: 'The hottest deals right now, ranked by click activity, discount %, and time-sensitivity. Updated every 15 minutes.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHotDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .order('hotness_score', { ascending: false })
      .order('click_count', { ascending: false })
      .limit(20)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
      affiliate_net: d.retailers?.affiliate_net,
    }))
  } catch { return [] }
}

async function getEditorsChoice(): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .eq('is_editors_choice', true)
      .order('hotness_score', { ascending: false })
      .limit(8)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
      affiliate_net: d.retailers?.affiliate_net,
    }))
  } catch { return [] }
}

export default async function HotDealsPage() {
  const [hotDeals, editorsChoice] = await Promise.all([
    getHotDeals(),
    getEditorsChoice(),
  ])

  return (
    <>
      <Header />
      <main>
        {/* Hero strip */}
        <section className="bg-gradient-to-r from-brand-red via-orange-600 to-yellow-500 py-12">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-white/90 text-sm hover:text-white">← Back to home</Link>
            <h1 className="font-heading text-4xl sm:text-5xl font-900 text-white uppercase tracking-tight mt-2">
              🔥 Hot Deals Right Now
            </h1>
            <p className="text-white/90 text-base mt-2 max-w-xl">
              Ranked by activity, discount, and time-sensitivity. Refreshed every 15 minutes.
            </p>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

          {/* EDITOR'S CHOICE */}
          {editorsChoice.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-yellow-500" />
                <div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-900 text-white uppercase tracking-tight">
                    ⭐ Editor's Choice
                  </h2>
                  <p className="text-brand-gray text-xs mt-0.5">Hand-picked deals our team genuinely recommends</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {editorsChoice.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </section>
          )}

          {/* TOP 20 HOTTEST */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-brand-red" />
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-900 text-white uppercase tracking-tight">
                  🔥 Top 20 Hottest Deals
                </h2>
                <p className="text-brand-gray text-xs mt-0.5">
                  Score combines clicks, discount %, recency, and urgency
                </p>
              </div>
            </div>

            {hotDeals.length === 0 ? (
              <div className="bg-brand-dark-3 border border-brand-dark-4 rounded-xl p-12 text-center">
                <p className="text-brand-gray">Hotness scores are computing. Check back in a few minutes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {hotDeals.map((deal, idx) => (
                  <div key={deal.id} className="relative">
                    {/* Rank number for top 5 */}
                    {idx < 5 && (
                      <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full
                                      bg-brand-red text-white font-black text-sm
                                      flex items-center justify-center shadow-glow border-2 border-brand-dark-2">
                        #{idx + 1}
                      </div>
                    )}
                    <DealCard deal={deal} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* HOW HOTNESS WORKS */}
          <section className="bg-brand-dark-3 border border-brand-dark-4 rounded-xl p-6 sm:p-8">
            <h3 className="font-heading text-xl font-900 text-white uppercase mb-4">
              How Hotness Scoring Works
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-brand-red font-bold mb-1">40% Engagement</div>
                <div className="text-brand-gray text-xs">Clicks + views + saves on the deal</div>
              </div>
              <div>
                <div className="text-brand-red font-bold mb-1">25% Discount Quality</div>
                <div className="text-brand-gray text-xs">Bigger % off = higher score</div>
              </div>
              <div>
                <div className="text-brand-red font-bold mb-1">20% Recency</div>
                <div className="text-brand-gray text-xs">Newer deals get more weight</div>
              </div>
              <div>
                <div className="text-brand-red font-bold mb-1">10% Urgency</div>
                <div className="text-brand-gray text-xs">Expiring soon? Boosted</div>
              </div>
              <div>
                <div className="text-brand-red font-bold mb-1">5% Editorial</div>
                <div className="text-brand-gray text-xs">Featured + editor's choice flags</div>
              </div>
              <div>
                <div className="text-brand-red font-bold mb-1">Tier Labels</div>
                <div className="text-brand-gray text-xs">🔥🔥 80+, 🔥 65+, 📈 45+, ✨ 25+, 🆕 below</div>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
