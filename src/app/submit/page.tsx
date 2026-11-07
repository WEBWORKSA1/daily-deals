import { Metadata } from 'next'
import SmartForm from '@/components/forms/SmartForm'
import { PageHero } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'Submit a Deal — Share a Great Find',
  description: 'Found a great deal? Share it with the Daily.Deals community. Every submission is reviewed, and top contributors are featured as Deal Hunter of the Month.',
  alternates: { canonical: '/submit' },
}

export default function SubmitPage() {
  return (
    <main>
      <PageHero eyebrow="COMMUNITY" title="Submit a deal" dek="Spotted a genuine bargain? Share it. Our editors review every submission, and the most helpful contributor each month is featured as Deal Hunter of the Month." />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1.3fr_1fr] gap-12">
        <section className="border border-ink p-6 sm:p-8 bg-white">
          <SmartForm formType="submit-deal" submitLabel="Submit deal for review →" successTitle="Thanks — your deal is in the review queue." successBody="If it passes our checks, it will appear on the site. We’ll email you if it’s featured."
            fields={[
              { name: 'url', label: 'Deal link', type: 'url', required: true, placeholder: 'https://retailer.com/product…' },
              { name: 'title', label: 'Product and offer', required: true, placeholder: 'e.g. Ninja 6-qt air fryer — $69 (was $129)' },
              { name: 'price', label: 'Deal price', type: 'number', required: true, half: true },
              { name: 'original_price', label: 'Regular price', type: 'number', half: true },
              { name: 'retailer', label: 'Store', required: true, half: true },
              { name: 'country', label: 'Country', type: 'select', options: [['US', 'United States'], ['CA', 'Canada'], ['BOTH', 'Both']], half: true, defaultValue: 'US' },
              { name: 'coupon', label: 'Coupon code (if any)', half: true },
              { name: 'expires', label: 'Ends (if known)', half: true, placeholder: 'e.g. Sunday night' },
              { name: 'notes', label: 'Why it’s a good deal', type: 'textarea', rows: 3, placeholder: 'Lowest price you’ve seen, stacking tips, size availability…' },
              { name: 'name', label: 'Your name or handle', half: true },
              { name: 'email', label: 'Your email', type: 'email', required: true, half: true, help: 'Used only to contact you about this submission.' },
              { name: 'no_affiliate', label: 'This link is not my own referral or affiliate link, and I am not paid by the seller.', type: 'checkbox', required: true },
            ]} />
        </section>
        <aside className="space-y-5 text-sm text-ink-2">
          <div className="section-eyebrow">WHAT MAKES A GREAT SUBMISSION</div>
          <ul className="list-disc pl-5 space-y-2">
            <li>A real price drop on a specific product — ideally its lowest price in months.</li>
            <li>A link to the retailer’s product page, not a search result.</li>
            <li>From a store with clear shipping and return policies.</li>
            <li>No referral or affiliate links, and nothing you are paid to promote.</li>
          </ul>
          <p>Retailers and brands who want to feature an offer should use our <a href="/advertise" className="underline text-ink">advertising page</a>.</p>
        </aside>
      </div>
    </main>
  )
}
