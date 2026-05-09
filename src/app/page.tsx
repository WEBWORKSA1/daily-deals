import { Metadata } from 'next'
import { Deal, Retailer } from '@/types'
import { supabase } from '@/lib/db'
import { ensureBootstrapped } from '@/lib/autoBootstrap'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/ui/HeroSection'
import NewsletterSignup from '@/components/ui/NewsletterSignup'
import StoreGrid from '@/components/ui/StoreGrid'
import DealSection from '@/components/ui/DealSection'
import FeaturedDeal from '@/components/ui/FeaturedDeal'
import DealTicker from '@/components/ui/DealTicker'
import LocalDealsSection from '@/components/ui/LocalDealsSection'
import InstallPrompt from '@/components/ui/InstallPrompt'

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

async function getHottestDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .order('hotness_score', { ascending: false })
      .order('discount_percent', { ascending: false })
      .limit(8)
    return mapDeals(data || [])
  } catch { return [] }
}

async function getEditorsChoice(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true).eq('is_editors_choice', true)
      .order('hotness_score', { ascending: false })
      .limit(4)
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

async function getClearanceDeals(): Promise<Deal[]> {
  try {
    const { data } = await supabase.from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true).eq('deal_type', 'clearance')
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
  ensureBootstrapped().catch(() => {})

  const [featured, hottest, editorsChoice, flash, clearance, usDeals, caDeals, retailers, totalDeals] = await Promise.all([
    getFeaturedDeals(),
    getHottestDeals(),
    getEditorsChoice(),
    getFlashDeals(),
    getClearanceDeals(),
    getUSDeals(),
    getCADeals(),
    getRetailers(),
    getTotalDeals()
  ])

  // Spotlight = first deal with a real image_url, falling back through tiers
  const spotlightCandidates = [...featured, ...hottest, ...flash]
  const spotlightDeal = spotlightCandidates.find(d => d.image_url) || spotlightCandidates[0] || null
  const noDealsYet = totalDeals === 0

  // Body deal sections render the spotlight too — but skip the one we used in the hero
  const bodySpotlight = spotlightDeal
  const bodySpotlightId = bodySpotlight?.id

  return (
    <>
      <Header />
      {!noDealsYet && <DealTicker deals={[...featured, ...flash].slice(0, 10)} />}
      <main>
        <HeroSection totalDeals={totalDeals} spotlightDeal={spotlightDeal} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

          {noDealsYet && (
            <section className="border border-rule p-10 lg:p-14 text-center max-w-2xl mx-auto">
              <div className="section-eyebrow mb-4">TONIGHT&apos;S EDITION DROPS AT MIDNIGHT EST</div>
              <h2 className="font-serif text-3xl text-ink mb-3">The first daily edition is on its way.</h2>
              <p className="text-ink-2 mb-6">
                Our editors are curating today&apos;s deals from 15 major retailers across the US and Canada. The first batch publishes shortly. Check back at the top of the hour, or subscribe below to get them in your inbox.
              </p>
              <NewsletterSignup />
            </section>
          )}

          {/* FEATURED DAILY DEAL — body spotlight (richer than hero card) */}
          {bodySpotlight && (
            <section>
              <div className="section-eyebrow mb-2">SECTION 01 · TODAY&apos;S SPOTLIGHT</div>
              <h2 className="section-h2 mb-1">Featured Daily Deal</h2>
              <p className="section-sub mb-7">Our editors&apos; pick of the day. Verified, vetted, and worth your time.</p>
              <FeaturedDeal deal={bodySpotlight} />
            </section>
          )}

          {!noDealsYet && <LocalDealsSection />}

          {hottest.length > 0 && (
            <DealSection
              title="Daily Hot Deals"
              subtitle="The eight deals our editors love most this morning, ranked by Hotness Score."
              deals={hottest.filter(d => d.id !== bodySpotlightId)}
              viewAllHref="/deals/hot"
              sectionNumber="02"
            />
          )}

          {editorsChoice.length > 0 && (
            <DealSection
              title="Editor's Choice"
              subtitle="Hand-picked by the editorial desk."
              deals={editorsChoice}
              viewAllHref="/deals/hot"
              sectionNumber="03"
            />
          )}

          {flash.length > 0 && (
            <DealSection
              title="Daily Flash Deals"
              subtitle="Time-sensitive markdowns. Move fast."
              deals={flash}
              viewAllHref="/deals/flash"
              sectionNumber="04"
              highlight
            />
          )}

          {(usDeals.length > 0 || caDeals.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {usDeals.length > 0 && (
                <DealSection
                  title="Daily US Deals"
                  subtitle="The best discounts shipping in the United States today."
                  deals={usDeals.slice(0, 6)}
                  viewAllHref="/deals/us"
                  sectionNumber="05·US"
                />
              )}
              {caDeals.length > 0 && (
                <DealSection
                  title="Daily Canadian Deals"
                  subtitle="Today's best across Canada — Toronto to Vancouver, Halifax to Calgary."
                  deals={caDeals.slice(0, 6)}
                  viewAllHref="/deals/canada"
                  sectionNumber="05·CA"
                />
              )}
            </div>
          )}

          {clearance.length > 0 && (
            <DealSection
              title="Daily Clearance Deals"
              subtitle="Year-end markdowns and final-call inventory."
              deals={clearance}
              viewAllHref="/deals/clearance"
              sectionNumber="06"
            />
          )}

          {!noDealsYet && <NewsletterSignup />}

          {retailers.length > 0 && (
            <section>
              <div className="section-eyebrow mb-2">SECTION 07 · DIRECTORY</div>
              <h2 className="section-h2 mb-1">Daily Deals by Store</h2>
              <p className="section-sub mb-7">Browse deals from your favorite retailers across North America.</p>
              <StoreGrid retailers={retailers} />
            </section>
          )}

        </div>
      </main>
      <Footer />
      <InstallPrompt />
    </>
  )
}
