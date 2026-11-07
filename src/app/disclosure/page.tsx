import { Metadata } from 'next'
import { PageHero, Prose } from '@/components/ui/Editorial'

export const metadata: Metadata = { title: 'Affiliate & Advertising Disclosure', description: 'How Daily.Deals earns money through affiliate links, advertising and sponsorships — and how we keep our recommendations independent.', alternates: { canonical: '/disclosure' } }

export default function DisclosurePage() {
  return (
    <main>
      <PageHero eyebrow="DISCLOSURE" title="How Daily.Deals makes money" dek="We want you to know exactly how we are paid, so you can judge our recommendations with full information." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Prose sections={[
          { h: 'Affiliate links', body: [
            'Daily.Deals is reader-supported. Many links to retailers are affiliate links: if you click one and make a purchase, the retailer may pay us a commission. The price you pay is the same.',
            'Daily.Deals is a participant in the Amazon Services LLC Associates Program and the Amazon.ca Associates Program, affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and Amazon.ca. As an Amazon Associate we earn from qualifying purchases.',
            'We also work with affiliate networks such as Skimlinks, which may convert ordinary retailer links into affiliate links automatically.',
          ]},
          { h: 'Advertising', body: ['We show ads served by Google AdSense and may run sponsored placements sold directly to brands. Ads are labelled “Advertisement” and sponsored deals are labelled “Sponsored”.'] },
          { h: 'Editorial independence', body: ['Commissions and advertising never change a deal’s score or rank. We feature deals because they are good deals, and we will not feature a sponsored offer we would not recommend on its own merits.'] },
          { h: 'Deal sources', body: ['Some deals are first spotted by other publications or communities. When that happens we credit and link to the source. Retailer names and logos are trademarks of their owners and are used for identification only.'] },
          { h: 'Reader contributions', body: ['Readers may choose to support Daily.Deals directly. Contributions are voluntary and do not affect coverage, deal scores or giveaway odds.'] },
        ]} />
      </div>
    </main>
  )
}
