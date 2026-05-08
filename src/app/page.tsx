import { Metadata } from 'next'
import { Deal, Retailer } from '@/types'
import { supabase } from '@/lib/db'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/ui/HeroSection'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import StoreGrid from '@/components/ui/StoreGrid'
import CategoryNav from '@/components/ui/CategoryNav'
import DealSection from '@/components/ui/DealSection'

export const metadata: Metadata = {
  title: 'Daily.Deals — Best Deals Today | US & Canada',
  description: "Find today's best deals from 1000+ top retailers. Personalized by your location — updated every 24 hours.",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getFeaturedDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('discount_percent', { ascending: false })
      .limit(8)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
    }))
  } catch { return [] }
}

async function getFlashDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .eq('deal_type', 'flash')
      .order('discount_percent', { ascending: false })
      .limit(8)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
    }))
  } catch { return [] }
}

async function getUSDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .in('country', ['US', 'BOTH'])
      .order('discount_percent', { ascending: false })
      .limit(12)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
    }))
  } catch { return [] }
}

async function getCADeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .in('country', ['CA', 'BOTH'])
      .order('discount_percent', { ascending: false })
      .limit(12)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
    }))
  } catch { return [] }
}

async function getRetailers(): Promise<Retailer[]> {
  try {
    const { data } = await supabase
      .from('retailers')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .limit(20)
    return data || []
  } catch { return [] }
}

async function getTotalDeals(): Promise<number> {
  try {
    const { count } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    return count || 0
  } catch { return 0 }
}

export default async function HomePage() {
  const [featured, flash, usDeals, caDeals, retailers, totalDeals] = await Promise.all([
    getFeaturedDeals(), getFlashDeals(), getUSDeals(), getCADeals(), getRetailers(), getTotalDeals()
  ])
  return (
    <>
      <Header />
      <main>
        <HeroSection totalDeals={totalDeals} />
        <CategoryNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
          {featured.length > 0 && <DealSection title="🔥 Today's Top Deals" subtitle="Hand-picked best deals of the day" deals={featured} viewAllHref="/deals/today" />}
          {flash.length > 0 && <DealSection title="⚡ Flash Deals" subtitle="Limited time — ends soon" deals={flash} viewAllHref="/deals/flash" highlight />}
          <DealSection title="🇺🇸 Best US Deals Today" subtitle="Top discounts from major US retailers" deals={usDeals} viewAllHref="/deals/us" />
          <DealSection title="🇨🇦 Best Canadian Deals Today" subtitle="Top discounts from Canadian retailers" deals={caDeals} viewAllHref="/deals/canada" />
          <NewsletterSignup />
          <div>
            <h2 className="section-title">🏪 Shop by Store</h2>
            <p className="text-gray-500 text-sm mb-6">Browse deals from your favourite retailers</p>
            <StoreGrid retailers={retailers} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
