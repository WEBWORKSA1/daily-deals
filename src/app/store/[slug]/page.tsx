import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/db'
import { getStoreGuide } from '@/lib/stores'
import { RETAILERS } from '@/lib/feeds/parse'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

interface Props { params: { slug: string } }

async function storeName(slug: string): Promise<string | null> {
  const g = getStoreGuide(slug) || getStoreGuide(slug.replace(/-us$/, ''))
  if (g) return g.name
  try {
    const { data } = await supabase.from('retailers').select('name').eq('slug', slug).maybeSingle()
    if (data?.name) return data.name
  } catch {}
  return RETAILERS.find(r => r.slug === slug)?.name || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = (await storeName(params.slug)) || 'Store'
  return {
    title: `${name} Deals & Coupons Today`,
    description: `Today’s best ${name} deals, price drops and savings tips — refreshed throughout the day by Daily.Deals.`,
    alternates: { canonical: `/store/${params.slug}` },
  }
}

export default async function StorePage({ params }: Props) {
  const name = (await storeName(params.slug)) || params.slug.replace(/-/g, ' ')
  const guide = getStoreGuide(params.slug) || getStoreGuide(params.slug.replace(/-us$/, ''))
  return (
    <>
      <DealListing
        eyebrow={`STORE · ${name.toUpperCase()}`}
        title={`${name} Deals`}
        dek={guide?.about || `The latest deals we have found from ${name}, ranked by real savings.`}
        query={{ store: params.slug.replace(/-us$/, '') }}
        ranked
        guideSlugs={['coupon-stacking-and-cashback', 'price-matching-guide']}
        explainer={guide ? [{ h: `Saving at ${name}`, body: guide.tips.join(' ') }, { h: 'Best times to buy', body: guide.bestTimes }] : undefined}
      />
      {guide && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Link href={`/coupons/${guide.slug}`} className="btn-outline">{name} coupons & savings guide →</Link>
        </div>
      )}
    </>
  )
}
