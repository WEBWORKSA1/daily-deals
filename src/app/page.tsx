import { Metadata } from 'next'
import { Deal, Retailer } from '@/types'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/ui/HeroSection'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import StoreGrid from '@/components/ui/StoreGrid'
import DealSection from '@/components/ui/DealSection'
import FeaturedDeal from '@/components/ui/FeaturedDeal'
import DealTicker from '@/components/ui/DealTicker'

export const metadata: Metadata = {
  title: 'Daily.Deals — Best Deals Today | US & Canada',
  description: "Find today's best deals from 1000+ top retailers across the US and Canada. Updated every 24 hours. Always free.",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function mapDeals(data: any[]): Deal[] {
  return (data || []).map((d: any) => ({
    ...d,
    retailer_name: d.retailers?.name,
    retailer_slug: d.retailers?.slug,
    retailer_brand_color: d.retailers?.brand_color,
    affiliate_net: d.retailers?.affiliate_net,
  }))
}

async function getFeaturedDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true).eq('is_featured', true)
      .order('discount_percent', { ascending: false }).limit(10)
    return mapDeals(data || [])
  } catch { return [] }
}

async function getFlashDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true).eq('deal_type', 'flash')
      .order('discount_percent', { ascending: false }).limit(10)
    return mapDeals(data || [])
  } catch { return [] }
}

async function getUSDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true).in('country', ['US', 'BOTH'])
      .order('discount_percent', { ascending: false }).limit(10)
    return mapDeals(data || [])
  } catch { return [] }
}

async function getCADeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true).in('country', ['CA', 'BOTH'])
      .order('discount_percent', { ascending: false }).limit(10)
    return mapDeals(data || [])
  } catch { return [] }
}

async function getRetailers(): Promise<Retailer[]> {
  try {
    const { data } = await supabase.from('retailers')
      .select('*').eq('is_active', true).order('name').limit(20)
    return data || []
  } catch { return [] }
}

async function getTotalDeals(): Promise<number> {
  try {
    const { count } = await supabase.from('deals')
      .select('*', { count: 'exact', head: true }).eq('is_active', true)
    return count || 0
  } catch { return 0 }
}

export default async function HomePage() {
  const [featured, flash, usDeals, caDeals, retailers, totalDeals] = await Promise.all([
    getFeaturedDeals(), getFlashDeals(), getUSDeals(), getCADeals(), getRetailers(), getTotalDeals()
  ])

  const spotlightDeal = featured[0] || flash[0] || null
  const remainingFeatured = featured.slice(1)

  return (
    <>
      <Header />
      {/* DEAL TICKER */}
      <DealTicker deals={[...featured, ...flash].slice(0, 10)} />

      <main>
        <HeroSection totalDeals={totalDeals} />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

          {/* SPOTLIGHT — BIG FEATURED DEAL */}
          {spotlightDeal && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-brand-red" />
                <h2 className="font-heading text-2xl sm:text-3xl font-900 text-white uppercase tracking-tight">
                  🔥 Deal of the Day
                </h2>
              </div>
              <FeaturedDeal deal={spotlightDeal} />
            </section>
          )}

          {/* TOP DEALS GRID */}
          {remainingFeatured.length > 0 && (
            <DealSection
              title="Today's Top Deals"
              subtitle="Hand-picked highest discounts"
              deals={remainingFeatured}
              viewAllHref="/deals/today"
            />
          )}

          {/* FLASH DEALS */}
          {flash.length > 0 && (
            <DealSection
              title="⚡ Flash Deals"
              subtitle="Limited time — grab them fast"
              deals={flash}
              viewAllHref="/deals/flash"
              highlight
            />
          )}

          {/* US + CA SIDE BY SIDE ON DESKTOP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DealSection
              title="🇺🇸 US Deals"
              subtitle="Top US retailer discounts"
              deals={usDeals.slice(0, 6)}
              viewAllHref="/deals/us"
            />
            <DealSection
              title="🇨🇦 Canadian Deals"
              subtitle="Top Canadian retailer discounts"
              deals={caDeals.slice(0, 6)}
              viewAllHref="/deals/canada"
            />
          </div>

          {/* NEWSLETTER */}
          <NewsletterSignup />

          {/* STORE GRID */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-brand-red" />
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-900 text-white uppercase tracking-tight">
                  🏪 Shop by Store
                </h2>
                <p className="text-brand-gray text-xs mt-0.5">Browse deals from your favourite retailers</p>
              </div>
            </div>
            <StoreGrid retailers={retailers} />
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
