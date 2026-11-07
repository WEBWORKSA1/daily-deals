// Top-level SEO aliases from the growth plan: /amazon-coupons, /walmart-deals, /black-friday-deals …
// Each permanently redirects to its canonical page. Anything else 404s.
import { permanentRedirect, notFound } from 'next/navigation'
import { STORE_GUIDES } from '@/lib/stores'

interface Props { params: { slug: string } }

const ALIASES: Record<string, string> = {
  'today-deals': '/deals/today', 'todays-deals': '/deals/today', 'best-deals-today': '/topic/best-deals-today',
  'hot-deals': '/deals/hot', 'flash-deals': '/deals/flash', 'clearance-deals': '/deals/clearance',
  'tech-deals': '/category/electronics', 'fashion-deals': '/category/fashion', 'home-deals': '/category/home-kitchen',
  'gaming-deals': '/category/gaming', 'beauty-deals': '/category/beauty', 'black-friday-deals': '/topic/black-friday-deals',
  'cyber-monday-deals': '/topic/black-friday-deals', 'under-50-deals': '/topic/cheap-gadgets-deals', 'price-drops': '/deals/hot',
  'blog': '/guides', 'newsletter': '/concierge#alerts', 'giveaways': '/contests', 'donate': '/support', 'jobs': '/careers',
  'advertise-with-us': '/advertise', 'privacy-policy': '/privacy', 'affiliate-disclosure': '/disclosure', 'copyright': '/legal', 'trademark': '/legal',
}
STORE_GUIDES.forEach(s => {
  ALIASES[`${s.slug}-coupons`] = `/coupons/${s.slug}`
  ALIASES[`${s.slug}-promo-codes`] = `/coupons/${s.slug}`
  ALIASES[`${s.slug}-discount-code`] = `/coupons/${s.slug}`
  ALIASES[`${s.slug}-deals`] = `/store/${s.slug}`
})

export const dynamicParams = false
export function generateStaticParams() { return Object.keys(ALIASES).map(slug => ({ slug })) }

export default function Alias({ params }: Props) {
  const to = ALIASES[params.slug]
  if (!to) notFound()
  permanentRedirect(to)
}
