import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATEGORIES } from '@/lib/utils'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

interface Props { params: { slug: string } }

const GUIDE_MAP: Record<string, string[]> = {
  electronics: ['tv-buying-guide', 'laptop-buying-guide', 'open-box-refurbished-guide'],
  gaming: ['big-online-sales-events-guide', 'black-friday-cyber-monday-playbook'],
  'home-kitchen': ['best-time-to-buy-calendar', 'price-matching-guide'],
  grocery: ['grocery-savings-guide', 'coupon-stacking-and-cashback'],
}

export function generateStaticParams() { return CATEGORIES.map(c => ({ slug: c.slug })) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) return { title: 'Category not found' }
  return {
    title: `${cat.label} Deals Today — Best ${cat.label} Discounts`,
    description: `Today’s best ${cat.label.toLowerCase()} deals from major US and Canadian retailers, ranked by real savings and refreshed throughout the day.`,
    alternates: { canonical: `/category/${cat.slug}` },
  }
}

export default function CategoryPage({ params }: Props) {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) notFound()
  return (
    <DealListing
      eyebrow={`CATEGORY · ${cat.label.toUpperCase()}`}
      title={`${cat.label} Deals`}
      dek={`The best ${cat.label.toLowerCase()} deals we can find right now across the US and Canada — scored, de-duplicated and refreshed all day.`}
      query={{ category: cat.slug }}
      ranked
      guideSlugs={GUIDE_MAP[cat.slug]}
      explainer={[{ h: 'How we sort this category', body: 'Deals are classified by product type and ranked by discount depth, freshness and price credibility. Items without a believable comparison price rank lower.' }]}
    />
  )
}
