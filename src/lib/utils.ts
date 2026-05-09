import { Deal, AffiliateNet } from '@/types'

const AMAZON_US_TAG = process.env.NEXT_PUBLIC_AMAZON_US_TAG || 'dailydeals-us-20'
const AMAZON_CA_TAG = process.env.NEXT_PUBLIC_AMAZON_CA_TAG || 'dailydeals-ca-20'

// Skimlinks publisher ID. Pattern A redirect URL works without an API key.
// Falls back to env var; the literal default is webworksa1's id from the script tag.
const SKIMLINKS_ID = process.env.NEXT_PUBLIC_SKIMLINKS_ID
  || process.env.SKIMLINKS_PUBLISHER_ID
  || '302790X1790814'

// Hosts where Amazon Associates handles attribution — don't double-wrap with Skimlinks
const AMAZON_HOSTS = ['amazon.com', 'amazon.ca', 'amazon.co.uk', 'a.co', 'amzn.to', 'amzn.com']

function isAmazon(host: string): boolean {
  const h = host.toLowerCase()
  return AMAZON_HOSTS.some(a => h === a || h.endsWith('.' + a))
}

// Wrap any retailer URL with Skimlinks Pattern A redirect.
// Result: https://go.skimresources.com/?id=<id>&xs=1&url=<encoded_target>
export function wrapWithSkimlinks(targetUrl: string): string {
  try {
    return `https://go.skimresources.com/?id=${SKIMLINKS_ID}&xs=1&url=${encodeURIComponent(targetUrl)}`
  } catch {
    return targetUrl
  }
}

export function buildAffiliateLink(deal: Deal, affiliateNet: AffiliateNet): string {
  try {
    const parsed = new URL(deal.affiliate_url)

    // Amazon — always use Associates tag, never wrap with Skimlinks (Amazon disallows mixing)
    if (affiliateNet === 'amazon' || isAmazon(parsed.hostname)) {
      parsed.searchParams.set('tag', deal.country === 'CA' ? AMAZON_CA_TAG : AMAZON_US_TAG)
      return parsed.toString()
    }

    // CJ / Impact / ShareASale / Awin — trust the existing tracked URL, return as-is.
    // (When the user signs into these networks, the URLs will already be pre-tracked.)
    if (affiliateNet === 'cj' || affiliateNet === 'impact' || affiliateNet === 'shareasale' || affiliateNet === 'awin') {
      return deal.affiliate_url
    }

    // Everything else (affiliateNet === 'direct' or unknown) → route through Skimlinks.
    // This monetizes ANY retailer URL via Skimlinks' merchant network, instantly.
    return wrapWithSkimlinks(deal.affiliate_url)
  } catch {
    return deal.affiliate_url
  }
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
