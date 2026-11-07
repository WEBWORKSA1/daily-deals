import { Metadata } from 'next'
import DonateWidget from '@/components/engage/DonateWidget'
import SmartForm from '@/components/forms/SmartForm'
import { SectionHead } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'Support Daily.Deals — Keep the Deal Desk Free',
  description: 'Help keep Daily.Deals free and independent. Fund operations, promotion, new hires, and monthly contests and prizes — one-time or monthly.',
  alternates: { canonical: '/support' },
}

export default function SupportPage({ searchParams }: { searchParams: { thanks?: string; purpose?: string } }) {
  return (
    <main>
      <section className="border-b border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_1.1fr] gap-10">
          <div>
            <div className="section-eyebrow mb-3 text-accent">SUPPORT DAILY.DEALS</div>
            <h1 className="font-serif text-5xl font-medium tracking-tight text-ink leading-[1.02] mb-5">Keep the deal desk free for everyone.</h1>
            {searchParams?.thanks && <div className="border border-good text-good p-4 mb-5 text-sm">Thank you — your support means a lot. A receipt is on its way from our payment provider.</div>}
            <p className="text-lg text-ink-2 leading-relaxed mb-6">Daily.Deals is free to read, with no paywall and no account required. Reader support pays for the parts that make it better: reliable data, more coverage, real people, and bigger prizes.</p>
            <div className="space-y-4">
              {[
                ['Operations', 'Servers, data sources, monitoring and the automation that refreshes deals around the clock.'],
                ['Promotion & marketing', 'Reaching more shoppers grows the community — and more readers means more leverage for exclusive deals.'],
                ['Hiring talent', 'Paying deal hunters, editors, short-form video creators and developers fairly for their work.'],
                ['Contests & prizes', 'Funding the monthly Daily Draw and community challenges like Deal Hunter of the Month.'],
              ].map(([t, s], i) => (
                <div key={t} id={i === 3 ? 'prizes' : undefined} className="flex gap-4"><span className="font-serif text-2xl text-accent w-6">{i + 1}</span><div><div className="font-medium text-ink">{t}</div><p className="text-sm text-ink-2">{s}</p></div></div>
              ))}
            </div>
          </div>
          <div className="border border-ink p-6 sm:p-8 bg-white">
            <h2 className="font-serif text-2xl text-ink mb-5">Make a contribution</h2>
            <DonateWidget initialPurpose={searchParams?.purpose || 'operations'} />
          </div>
        </div>
      </section>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-12">
        <section>
          <SectionHead n="01" eyebrow="SPONSOR A PRIZE OR PLEDGE" title="Prefer to pledge, sponsor or give in kind?" sub="Businesses and individuals can sponsor a giveaway, donate products as prizes, fund a hire, or pledge a recurring contribution. Tell us what you have in mind." />
          <SmartForm formType="pledge" submitLabel="Send my pledge →" successTitle="Thank you for your pledge." successBody="We’ll follow up by email within two business days to arrange the details."
            fields={[
              { name: 'name', label: 'Name', required: true, half: true },
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'company', label: 'Company (optional)', half: true },
              { name: 'pledge_type', label: 'Type of support', type: 'select', required: true, half: true, options: ['Sponsor a monthly giveaway', 'Donate products as prizes', 'Fund a role or project', 'Recurring pledge', 'Marketing or media support', 'Other'] },
              { name: 'amount', label: 'Approximate value (optional)', half: true, placeholder: 'e.g. $500 / month' },
              { name: 'purpose', label: 'Earmark for', type: 'select', half: true, options: ['Operations', 'Promotion & marketing', 'Hiring talent', 'Contests & prizes', 'Where needed most'] },
              { name: 'message', label: 'Details', type: 'textarea', rows: 4 },
            ]} />
        </section>
        <section>
          <SectionHead n="02" eyebrow="OTHER WAYS TO HELP" title="Free ways to support us" />
          <ul className="space-y-4 text-ink-2">
            <li><strong className="text-ink font-medium">Shop through our links.</strong> When you buy through a deal on Daily.Deals, the retailer may pay us a small commission at no cost to you.</li>
            <li><strong className="text-ink font-medium">Share a deal or guide.</strong> Every share brings new readers to the community.</li>
            <li><strong className="text-ink font-medium">Submit deals.</strong> Found something great? <a href="/submit" className="underline">Post it for everyone</a>.</li>
            <li><strong className="text-ink font-medium">Subscribe.</strong> The Daily Edition newsletter is the single best way to help us grow.</li>
            <li><strong className="text-ink font-medium">Allow ads.</strong> Ads keep the site free; we keep them clearly labelled and out of the way.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
