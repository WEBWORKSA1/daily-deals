import { Metadata } from 'next'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Daily Hot Deals',
  description: 'The strongest deals on the internet right now, ranked by our hotness score — discount depth, freshness, price credibility and shopper activity.',
  alternates: { canonical: '/deals/hot' },
}

export default function Page() {
  return (
    <DealListing
      eyebrow="DAILY HOT · RANKED"
      title="Daily Hot Deals"
      dek="The strongest deals on the internet right now, ranked by our hotness score — discount depth, freshness, price credibility and shopper activity."
      query={{ feed: 'hot' }}
      ranked={true}
      guideSlugs={['how-to-tell-if-a-deal-is-real', 'price-alerts-guide', 'black-friday-cyber-monday-playbook']}
      explainer={[
        { h: 'How we rank', body: 'Each deal gets a 0–100 hotness score combining discount size, how recently it was found, whether the comparison price is credible, and how shoppers engage with it. The list re-ranks automatically through the day.' },
        { h: 'Prices change fast', body: 'Retailers set prices and stock, and both can change at any time. Always confirm the final price, shipping and return terms at checkout before you buy.' },
      ]}
    />
  )
}
