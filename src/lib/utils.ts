import { Deal, AffiliateNet } from '@/types'

const AMAZON_US_TAG = process.env.NEXT_PUBLIC_AMAZON_US_TAG || 'dailydeals-us-20'
const AMAZON_CA_TAG = process.env.NEXT_PUBLIC_AMAZON_CA_TAG || 'dailydeals-ca-20'

export function buildAffiliateLink(deal: Deal, affiliateNet: AffiliateNet): string {
  try {
    const parsed = new URL(deal.affiliate_url)
    if (affiliateNet === 'amazon') {
      parsed.searchParams.set('tag', deal.country === 'CA' ? AMAZON_CA_TAG : AMAZON_US_TAG)
      return parsed.toString()
    }
    return deal.affiliate_url
  } catch { return deal.affiliate_url }
}

export function formatPrice(price: number, country: string): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: country === 'CA' ? 'CAD' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function getTimeRemaining(expiresAt: string): string | null {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const CATEGORIES = [
  { slug: 'electronics',     label: 'Electronics',    icon: '💻' },
  { slug: 'fashion',         label: 'Fashion',         icon: '👗' },
  { slug: 'home-kitchen',    label: 'Home & Kitchen',  icon: '🏠' },
  { slug: 'sports-outdoors', label: 'Sports',          icon: '⚽' },
  { slug: 'grocery',         label: 'Grocery',         icon: '🛒' },
  { slug: 'beauty',          label: 'Beauty',          icon: '💄' },
  { slug: 'gaming',          label: 'Gaming',          icon: '🎮' },
  { slug: 'tools',           label: 'Tools',           icon: '🔧' },
  { slug: 'automotive',      label: 'Automotive',      icon: '🚗' },
  { slug: 'office',          label: 'Office',          icon: '🖥️' },
]
