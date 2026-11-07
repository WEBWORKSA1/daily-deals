import { Metadata } from 'next'
import SmartForm from '@/components/forms/SmartForm'
import { SectionHead } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'Careers — Join the Daily.Deals Team',
  description: 'Remote, flexible roles for deal hunters, editors, short-form video creators, partnerships and developers in the US and Canada.',
  alternates: { canonical: '/careers' },
}

const ROLES: Array<[string, string, string]> = [
  ['Deal Hunter', 'Freelance · Remote', 'Find, verify and post the best deals in a category you know well. Paid per published deal plus monthly bonuses.'],
  ['Editorial Writer', 'Freelance · Remote', 'Write clear, practical buying guides and the Daily Edition notes in our calm, editorial voice.'],
  ['Short-form Video Creator', 'Contract · Remote', 'Turn the day’s top deals into 30–60 second videos for TikTok, Reels and YouTube Shorts.'],
  ['Partnerships & Ad Sales', 'Commission · Remote', 'Bring brands, retailers and local businesses onto sponsored placements and giveaways.'],
  ['Community Moderator', 'Part-time · Remote', 'Keep comments and submissions helpful, friendly and spam-free.'],
  ['Full-stack Developer', 'Contract · Remote', 'Next.js, TypeScript and Postgres. Help us build price tracking, alerts and the mobile app.'],
]

export default function CareersPage() {
  const jobs = ROLES.map(([t, type, d]) => ({
    '@context': 'https://schema.org', '@type': 'JobPosting', title: t, description: d, datePosted: '2026-11-01',
    employmentType: type.startsWith('Part') ? 'PART_TIME' : 'CONTRACTOR', jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: [{ '@type': 'Country', name: 'US' }, { '@type': 'Country', name: 'CA' }],
    hiringOrganization: { '@type': 'Organization', name: 'Daily.Deals', sameAs: 'https://daily.deals' },
  }))
  return (
    <main>
      {jobs.map((j, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />)}
      <section className="border-b border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="section-eyebrow mb-3 text-accent">CAREERS</div>
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink leading-[1.02] mb-5 max-w-3xl">Help millions of people pay less.</h1>
          <p className="text-lg text-ink-2 leading-relaxed max-w-2xl">We are a small, remote, automation-first team. People do what software can’t: judgment, taste and trust. If that sounds like you, we’d love to hear from you.</p>
        </div>
      </section>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_1fr] gap-12">
        <section>
          <SectionHead n="01" eyebrow="OPEN ROLES" title="Where you could fit" />
          <div className="divide-y divide-rule border-y border-rule">
            {ROLES.map(([t, type, d]) => (<div key={t} className="py-5"><div className="flex justify-between gap-3 mb-1"><h3 className="font-serif text-xl text-ink">{t}</h3><span className="text-[11px] tracking-wider text-ink-muted whitespace-nowrap">{type.toUpperCase()}</span></div><p className="text-sm text-ink-2">{d}</p></div>))}
          </div>
        </section>
        <section>
          <SectionHead n="02" eyebrow="APPLY" title="Send your application" sub="No cover letter needed — links to your work say more." />
          <SmartForm formType="careers" submitLabel="Submit application →" successTitle="Application received." successBody="Thank you. If there’s a fit, we’ll reach out by email to set up a short call."
            fields={[
              { name: 'name', label: 'Full name', required: true, half: true },
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'role', label: 'Role', type: 'select', required: true, half: true, options: ROLES.map(r => r[0]).concat(['Something else']) },
              { name: 'country', label: 'Country', type: 'select', half: true, options: [['US', 'United States'], ['CA', 'Canada'], ['Other', 'Other']] },
              { name: 'portfolio', label: 'Portfolio / LinkedIn / work samples', type: 'url', placeholder: 'https://' },
              { name: 'availability', label: 'Availability', type: 'radio', options: ['A few hours a week', 'Part-time', 'Full-time'] },
              { name: 'message', label: 'Why you’d be great at this', type: 'textarea', rows: 5, required: true },
            ]} />
        </section>
      </div>
    </main>
  )
}
