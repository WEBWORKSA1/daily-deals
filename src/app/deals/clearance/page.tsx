import { Metadata } from 'next'
import DealListing from '@/components/ui/DealListing'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Daily Clearance Deals',
  description: 'Closeouts, open-box, refurbished and final-call inventory — the deepest discounts, usually while stock lasts.',
  alternates: { canonical: '/deals/clearance' },
}

export default function Page() {
  return (
    <DealListing
      eyebrow="DAILY CLEARANCE · LAST CALL"
      title="Daily Clearance Deals"
      dek="Closeouts, open-box, refurbished and final-call inventory — the deepest discounts, usually while stock lasts."
      query={{ feed: 'clearance' }}
      ranked={false}
      guideSlugs={['open-box-refurbished-guide', 'best-time-to-buy-calendar']}
      explainer={[
        { h: 'How we rank', body: 'Clearance includes closeouts, open-box and refurbished stock, liquidation and final-sale items. Read condition notes and return terms carefully — they matter more here than anywhere else.' },
        { h: 'Prices change fast', body: 'Retailers set prices and stock, and both can change at any time. Always confirm the final price, shipping and return terms at checkout before you buy.' },
      ]}
    />
  )
}
