import { Metadata } from 'next'
import SmartForm from '@/components/forms/SmartForm'
import { PageHero } from '@/components/ui/Editorial'
import { INQUIRY_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact Daily.Deals',
  description: 'Contact the Daily.Deals team about deals, corrections, partnerships, sponsorship, advertising, press, or acquiring this website and domain.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <main>
      <PageHero eyebrow="CONTACT" title="Get in touch" dek="Questions, corrections, partnerships or press — send a note and a real person will read it. We usually reply within one to two business days." />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1.3fr_1fr] gap-12">
        <section className="border border-ink p-6 sm:p-8 bg-white">
          <SmartForm formType="contact" submitLabel="Send message →" successTitle="Message sent." successBody="Thanks for reaching out. We’ll reply to the email address you provided."
            fields={[
              { name: 'name', label: 'Name', required: true, half: true },
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'subject', label: 'Topic', type: 'select', required: true, options: [
                'Interested in buying this website / domain name', 'Sponsorship', 'Advertising', 'Partnership', 'Report a deal problem or price error',
                'Correction or feedback', 'Press & media', 'Careers', 'Copyright / DMCA', 'Something else',
              ] },
              { name: 'company', label: 'Company (optional)', half: true },
              { name: 'phone', label: 'Phone (optional)', type: 'tel', half: true },
              { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 6 },
            ]}
            footnote={<>We use your details only to respond to you. See our <a href="/privacy" className="underline">Privacy Policy</a>.</>} />
        </section>
        <aside className="space-y-6">
          <div className="border border-rule p-6">
            <div className="section-eyebrow mb-2 text-accent">WEBSITE, DOMAIN & PARTNERSHIPS</div>
            <p className="text-sm text-ink-2 mb-4">Interested in this website or the Daily.Deals domain name, or in sponsorship, advertising or a strategic partnership?</p>
            <a href={INQUIRY_URL} target="_blank" rel="noopener" className="btn-primary">Contact the owner →</a>
          </div>
          <div className="border border-rule p-6 space-y-3 text-sm text-ink-2">
            <div className="section-eyebrow">QUICK LINKS</div>
            <p><a href="/advertise" className="underline text-ink">Advertising packages</a> — sponsored placements, newsletter and giveaways.</p>
            <p><a href="/submit" className="underline text-ink">Submit a deal</a> — share a great find with the community.</p>
            <p><a href="/careers" className="underline text-ink">Careers</a> — remote roles for hunters, writers and creators.</p>
            <p><a href="/legal#dmca" className="underline text-ink">Copyright & DMCA</a> — how to report infringing material.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}
