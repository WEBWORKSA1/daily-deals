import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealCard from '@/components/deals/DealCard'
import PriceChart from '@/components/ui/PriceChart'
import CouponFeedback from '@/components/ui/CouponFeedback'
import Comments from '@/components/ui/Comments'
import ShareBar from '@/components/deals/ShareBar'
import { supabase } from '@/lib/db'
import { Deal } from '@/types'
import { formatPrice } from '@/lib/utils'
import { hotnessTier } from '@/lib/hotness'
import { priceQualityRating } from '@/lib/priceHistory'
import { buildProductSchema, buildBreadcrumbSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props { params: { id: string } }

async function getDeal(id: number): Promise<Deal | null> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net, country, website_url)')
      .eq('id', id)
      .single()
    if (!data) return null
    return {
      ...data,
      retailer_name: (data as any).retailers?.name,
      retailer_slug: (data as any).retailers?.slug,
      retailer_brand_color: (data as any).retailers?.brand_color,
      affiliate_net: (data as any).retailers?.affiliate_net,
    }
  } catch { return null }
}

async function getRelatedDeals(deal: Deal): Promise<Deal[]> {
  try {
    const { data } = await supabase
      .from('deals')
      .select('*, retailers(name, slug, brand_color, affiliate_net)')
      .eq('is_active', true)
      .eq('category', deal.category)
      .neq('id', deal.id)
      .order('hotness_score', { ascending: false })
      .limit(4)
    return (data || []).map((d: any) => ({
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
      affiliate_net: d.retailers?.affiliate_net,
    }))
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const deal = await getDeal(parseInt(params.id))
  if (!deal) return { title: 'Deal not found — Daily.Deals' }
  const url = `https://daily.deals/deal/${deal.id}`
  const ogImageUrl = `https://daily.deals/deal/${deal.id}/og-image`
  const discount = deal.discount_percent || (deal.original_price
    ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
    : 0)
  return {
    title: `${deal.title} — ${formatPrice(deal.deal_price, deal.country)} | Daily.Deals`,
    description: deal.description || `${deal.title} on sale at ${deal.retailer_name}. Save ${discount}% today.`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${deal.title} — ${discount}% OFF`,
      description: deal.description || `${deal.title} on sale at ${deal.retailer_name}.`,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: deal.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deal.title} — ${discount}% OFF`,
      description: deal.description || `${deal.title} on sale at ${deal.retailer_name}.`,
      images: [ogImageUrl],
    },
  }
}

export default async function DealPage({ params }: Props) {
  const id = parseInt(params.id)
  if (isNaN(id)) return notFound()

  const deal = await getDeal(id)
  if (!deal) return notFound()

  const related = await getRelatedDeals(deal)

  const score = deal.hotness_score || 0
  const tier = score >= 45 ? hotnessTier(score) : null
  const quality = priceQualityRating(deal as any)
  const discount = deal.discount_percent || (deal.original_price
    ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
    : 0)
  const savings = deal.original_price ? deal.original_price - deal.deal_price : null

  const productSchema = buildProductSchema(deal as any)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://daily.deals' },
    ...(deal.retailer_slug ? [{ name: deal.retailer_name || 'Store', url: `https://daily.deals/store/${deal.retailer_slug}` }] : []),
    { name: deal.title, url: `https://daily.deals/deal/${deal.id}` },
  ])

  return (
    <>
      <Script id={`product-schema-${id}`} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Script id={`breadcrumb-schema-${id}`} type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />
      <main>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="text-xs text-brand-gray flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            {deal.retailer_slug && (
              <>
                <Link href={`/store/${deal.retailer_slug}`} className="hover:text-white">
                  {deal.retailer_name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white truncate max-w-md">{deal.title}</span>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          <div>
            <div className="bg-brand-dark-3 border border-white/5 rounded-2xl overflow-hidden mb-6">
              {deal.image_url ? (
                <img src={deal.image_url} alt={deal.title} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-8xl opacity-20">🛍️</div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tier && (
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1"
                      style={{ background: tier.color, color: tier.textColor }}>
                  {tier.emoji} {tier.label}
                </span>
              )}
              {deal.is_editors_choice && (
                <span className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black text-xs font-black
                                 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  ⭐ Editor's Pick
                </span>
              )}
              {(deal.is_verified || (deal.click_count || 0) >= 5) && (
                <span className="bg-brand-green/90 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  ✓ Verified
                </span>
              )}
              {deal.deal_type === 'flash' && (
                <span className="bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-xs
                                 font-bold px-2.5 py-1 rounded-md">⚡ Flash Deal</span>
              )}
              {deal.deal_type === 'clearance' && (
                <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs
                                 font-bold px-2.5 py-1 rounded-md">Clearance</span>
              )}
              <span className="text-xs px-2.5 py-1">{deal.country === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States'}</span>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-900 text-white mb-3 leading-tight">
              {deal.title}
            </h1>

            {deal.description && (
              <p className="text-brand-gray-2 text-sm leading-relaxed mb-6 max-w-3xl">
                {deal.description}
              </p>
            )}

            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6 mb-6">
              <div className="flex flex-wrap items-baseline gap-3 mb-3">
                <span className="font-heading text-5xl font-900 text-brand-red leading-none">
                  {formatPrice(deal.deal_price, deal.country)}
                </span>
                {deal.original_price && (
                  <span className="text-brand-gray text-2xl line-through">
                    {formatPrice(deal.original_price, deal.country)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-brand-red text-white text-sm font-black px-3 py-1 rounded-md uppercase tracking-wider">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {savings && savings > 0 && (
                <div className="text-brand-green font-bold mb-3">
                  You save {formatPrice(savings, deal.country)}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 text-sm">
                <span className="text-brand-gray text-xs">Price quality:</span>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={n <= quality.stars ? '' : 'opacity-20'}
                          style={{ color: quality.color }}>★</span>
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: quality.color }}>
                  {quality.label}
                </span>
              </div>

              <a href={deal.affiliate_url} target="_blank" rel="noopener noreferrer"
                 className="block w-full bg-brand-red hover:bg-red-600 text-white text-center
                            font-bold uppercase tracking-wider py-4 rounded-lg shadow-glow transition-all">
                Get This Deal at {deal.retailer_name} →
              </a>
              <p className="text-brand-gray text-[10px] text-center mt-2">
                Affiliate link · We may earn commission at no extra cost to you
              </p>
            </div>

            {/* SHARE BAR — Pinterest, Facebook, Twitter, Reddit, copy link */}
            <ShareBar dealId={deal.id} title={deal.title}
              ogImageUrl={`https://daily.deals/deal/${deal.id}/og-image`} />

            {/* COMMENTS */}
            <div className="mb-6 mt-6">
              <Comments dealId={deal.id} />
            </div>

            {related.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-900 text-white uppercase mb-4">
                  More {deal.category} Deals
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {related.map(d => <DealCard key={d.id} deal={d} />)}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <PriceChart dealId={deal.id} />
            {deal.coupon_code && <CouponFeedback dealId={deal.id} couponCode={deal.coupon_code} />}

            {deal.retailer_slug && (
              <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6">
                <h3 className="text-white font-bold mb-3">🏪 About the Store</h3>
                <Link href={`/store/${deal.retailer_slug}`}
                  className="block text-brand-red hover:text-white text-sm font-bold mb-1">
                  {deal.retailer_name} →
                </Link>
                <p className="text-brand-gray text-xs">
                  See all current deals from {deal.retailer_name}.
                </p>
              </div>
            )}

            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6">
              <h3 className="text-white font-bold mb-3">📊 Deal Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-brand-gray">Hotness score</span>
                  <span className="text-white font-mono">{score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Clicks</span>
                  <span className="text-white font-mono">{deal.click_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Saves</span>
                  <span className="text-white font-mono">{deal.save_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Net votes</span>
                  <span className="text-white font-mono">
                    {((deal as any).upvote_count || 0) - ((deal as any).downvote_count || 0)}
                  </span>
                </div>
                {deal.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Expires</span>
                    <span className="text-brand-red">{new Date(deal.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
