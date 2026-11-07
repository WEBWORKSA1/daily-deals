import { Metadata } from 'next'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Daily Canadian Deals',
  description: 'Today’s best prices from Canadian storefronts — Amazon.ca, Walmart Canada, Best Buy Canada, Canadian Tire and more, in Canadian dollars.',
  alternates: { canonical: '/deals/canada' },
}

export default function Page() {
  return (
    <DealListing
      eyebrow="DAILY CANADIAN · CANADA"
      title="Daily Canadian Deals"
      dek="Today’s best prices from Canadian storefronts — Amazon.ca, Walmart Canada, Best Buy Canada, Canadian Tire and more, in Canadian dollars."
      query={{ feed: 'canada' }}
      ranked={true}
      guideSlugs={['canadian-shopping-guide', 'price-matching-guide']}
      explainer={[
        { h: 'How we rank', body: 'Canadian deals come from Canadian storefronts and community sources, priced in Canadian dollars. Cross-border offers are excluded so duties and exchange rates don’t surprise you.' },
        { h: 'Prices change fast', body: 'Retailers set prices and stock, and both can change at any time. Always confirm the final price, shipping and return terms at checkout before you buy.' },
      ]}
    />
  )
}
