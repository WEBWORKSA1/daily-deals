import { Metadata } from 'next'
import SmartForm from '@/components/forms/SmartForm'
import { SectionHead } from '@/components/ui/Editorial'
import { INQUIRY_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Advertise, Sponsor & Partner with Daily.Deals',
  description: 'Reach high-intent deal shoppers in the US and Canada: featured deal placements, newsletter sponsorships, sponsored giveaways, local business listings and affiliate partnerships.',
  alternates: { canonical: '/advertise' },
}

const PACKAGES: Array<[string, string, string[]]> = [
  ['Starter', 'From $99', ['Featured listing in a category for 7 days', '“Sponsored” label and tracked link', 'Performance summary']],
  ['Pro', 'From $299', ['Homepage featured-deal placement for 7 days', 'One newsletter mention', 'Category placement', 'Click reporting']],
  ['Premium', 'From $999', ['Homepage spotlight for 14 days', 'Dedicated newsletter feature', 'Sponsored monthly giveaway', 'Social and video mention', 'Custom landing page']],
]

export default function AdvertisePage() {
  return (
    <main>
      <section className="border-b border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="section-eyebrow mb-3 text-accent">FOR BRANDS, RETAILERS & LOCAL BUSINESSES</div>
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink leading-[1.02] mb-5 max-w-4xl">Put your offer in front of people who are ready to buy.</h1>
          <p className="text-lg text-ink-2 leading-relaxed max-w-2xl">Daily.Deals readers arrive with intent: they are comparing prices and looking for a reason to buy today. Sponsored placements are always clearly labelled, and we only feature genuine offers.</p>
        </div>
      </section>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <section>
          <SectionHead n="01" eyebrow="PACKAGES" title="Sponsored placements" sub="Indicative starting prices. Every campaign is confirmed in writing before it runs." />
          <div className="grid md:grid-cols-3 gap-px bg-rule border border-rule">
            {PACKAGES.map(([n, p, f], i) => (
              <div key={n} className={`bg-white p-7 ${i === 1 ? 'outline outline-2 outline-ink -outline-offset-2' : ''}`}>
                <div className="section-eyebrow mb-2">{i === 1 ? 'MOST POPULAR' : 'PACKAGE'}</div>
                <div className="font-serif text-3xl text-ink">{n}</div>
                <div className="font-mono text-accent text-lg mb-4">{p}</div>
                <ul className="space-y-2 text-sm text-ink-2">{f.map(x => <li key={x} className="flex gap-2"><span className="text-accent">✓</span>{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
        <section className="grid lg:grid-cols-[1.1fr_1fr] gap-12">
          <div>
            <SectionHead n="02" eyebrow="START A CONVERSATION" title="Tell us about your campaign" />
            <SmartForm formType="advertise" submitLabel="Request a proposal →" successTitle="Request received." successBody="We’ll reply with availability and a proposal within two business days."
              fields={[
                { name: 'name', label: 'Your name', required: true, half: true },
                { name: 'email', label: 'Work email', type: 'email', required: true, half: true },
                { name: 'company', label: 'Company / brand', required: true, half: true },
                { name: 'website', label: 'Website', type: 'url', half: true, placeholder: 'https://' },
                { name: 'interest', label: 'Interested in', type: 'select', required: true, half: true, options: ['Sponsored deal placement', 'Newsletter sponsorship', 'Sponsored giveaway', 'Display advertising', 'Affiliate partnership', 'Local business listing', 'Content partnership', 'Other'] },
                { name: 'budget', label: 'Monthly budget', type: 'select', half: true, options: ['Under $250', '$250–$1,000', '$1,000–$5,000', '$5,000+', 'Not sure yet'] },
                { name: 'market', label: 'Target market', type: 'radio', options: ['United States', 'Canada', 'Both'] },
                { name: 'message', label: 'Goals and timing', type: 'textarea', required: true, rows: 5 },
              ]} />
          </div>
          <div className="space-y-10">
            <div id="sponsor">
              <SectionHead n="03" eyebrow="GIVEAWAYS" title="Sponsor a Daily Draw" sub="Fund or supply the monthly prize and get featured on the giveaway page, entry confirmation and newsletter." />
            </div>
            <div id="local">
              <SectionHead n="04" eyebrow="LOCAL" title="List a local business deal" sub="Restaurants, gyms, salons and services can post a deal for nearby shoppers." />
              <SmartForm formType="local-business" compact submitLabel="Submit my local deal →" successTitle="Thanks — listing received." successBody="We review every local listing before it goes live and will email you with next steps."
                fields={[
                  { name: 'company', label: 'Business name', required: true, half: true },
                  { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                  { name: 'city', label: 'City', required: true, half: true },
                  { name: 'postal', label: 'ZIP / postal code', half: true },
                  { name: 'offer', label: 'Your offer', required: true, placeholder: 'e.g. 30% off first month' },
                ]} />
            </div>
            <div className="border border-rule p-5 text-sm text-ink-2">
              Interested in acquiring this website or the domain, or in a strategic partnership? <a href={INQUIRY_URL} target="_blank" rel="noopener" className="underline text-ink">Contact the owner →</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
