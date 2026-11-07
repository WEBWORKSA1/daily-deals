import { Metadata } from 'next'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Daily US Deals',
  description: 'The best discounts from retailers shipping across the United States today — from Amazon and Walmart to Best Buy, Target and beyond.',
  alternates: { canonical: '/deals/us' },
}

export default function Page() {
  return (
    <DealListing
      eyebrow="DAILY US · UNITED STATES"
      title="Daily US Deals"
      dek="The best discounts from retailers shipping across the United States today — from Amazon and Walmart to Best Buy, Target and beyond."
      query={{ feed: 'us' }}
      ranked={true}
      guideSlugs={['best-time-to-buy-calendar', 'coupon-stacking-and-cashback']}
      explainer={[
        { h: 'How we rank', body: 'US deals are offers from retailers that ship to US addresses. Prices are shown in US dollars and ranked by our hotness score.' },
        { h: 'Prices change fast', body: 'Retailers set prices and stock, and both can change at any time. Always confirm the final price, shipping and return terms at checkout before you buy.' },
      ]}
    />
  )
}
