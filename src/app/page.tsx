import { Metadata } from 'next'
import { query } from '@/lib/db'
import { Deal, Retailer } from '@/types'
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

export const revalidate = 3600

async function getFeaturedDeals() {
  return query<Deal>(`SELECT d.*, r.name AS retailer_name, r.slug AS retailer_slug, r.brand_color AS retailer_brand_color, r.affiliate_net FROM deals d JOIN retailers r ON d.retailer_id = r.id WHERE d.is_active = 1 AND d.is_featured = 1 AND (d.expires_at IS NULL OR d.expires_at > NOW()) ORDER BY d.discount_percent DESC LIMIT 8`)
}
async function getFlashDeals() {
  return query<Deal>(`SELECT d.*, r.name AS retailer_name, r.slug AS retailer_slug, r.brand_color AS retailer_brand_color, r.affiliate_net FROM deals d JOIN retailers r ON d.retailer_id = r.id WHERE d.is_active = 1 AND d.deal_type = 'flash' AND (d.expires_at IS NULL OR d.expires_at > NOW()) ORDER BY d.discount_percent DESC LIMIT 8`)
}
async function getUSDeals() {
  return query<Deal>(`SELECT d.*, r.name AS retailer_name, r.slug AS retailer_slug, r.brand_color AS retailer_brand_color, r.affiliate_net FROM deals d JOIN retailers r ON d.retailer_id = r.id WHERE d.is_active = 1 AND (d.country = 'US' OR d.country = 'BOTH') AND (d.expires_at IS NULL OR d.expires_at > NOW()) ORDER BY d.discount_percent DESC LIMIT 12`)
}
async function getCADeals() {
  return query<Deal>(`SELECT d.*, r.name AS retailer_name, r.slug AS retailer_slug, r.brand_color AS retailer_brand_color, r.affiliate_net FROM deals d JOIN retailers r ON d.retailer_id = r.id WHERE d.is_active = 1 AND (d.country = 'CA' OR d.country = 'BOTH') AND (d.expires_at IS NULL OR d.expires_at > NOW()) ORDER BY d.discount_percent DESC LIMIT 12`)
}
async function getRetailers() {
  return query<Retailer>(`SELECT r.*, COUNT(d.id) AS deal_count FROM retailers r LEFT JOIN deals d ON d.retailer_id = r.id AND d.is_active = 1 AND (d.expires_at IS NULL OR d.expires_at > NOW()) WHERE r.is_active = 1 GROUP BY r.id ORDER BY deal_count DESC LIMIT 20`)
}
async function getTotalDeals(): Promise<number> {
  const rows = await query<{ count: number }>(`SELECT COUNT(*) as count FROM deals WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())`)
  return rows[0]?.count || 0
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
