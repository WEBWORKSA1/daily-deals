import { Metadata } from 'next'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Daily Flash Deals',
  description: 'Lightning-fast markdowns, one-day sales and limited-quantity offers. These move quickly — check them early.',
  alternates: { canonical: '/deals/flash' },
}

export default function Page() {
  return (
    <DealListing
      eyebrow="DAILY FLASH · TIME-SENSITIVE"
      title="Daily Flash Deals"
      dek="Lightning-fast markdowns, one-day sales and limited-quantity offers. These move quickly — check them early."
      query={{ feed: 'flash' }}
      ranked={false}
      guideSlugs={['how-to-tell-if-a-deal-is-real', 'big-online-sales-events-guide']}
      explainer={[
        { h: 'How we rank', body: 'Flash deals are offers with a short window: one-day sales, lightning deals, doorbusters, or prices expiring within 48 hours. We sort them by discount so the deepest cuts come first.' },
        { h: 'Prices change fast', body: 'Retailers set prices and stock, and both can change at any time. Always confirm the final price, shipping and return terms at checkout before you buy.' },
      ]}
    />
  )
}
