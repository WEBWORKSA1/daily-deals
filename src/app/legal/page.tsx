import { Metadata } from 'next'
import { PageHero, Prose } from '@/components/ui/Editorial'
import SmartForm from '@/components/forms/SmartForm'

export const metadata: Metadata = { title: 'Trademark & Copyright Notice', description: 'Trademark, copyright and DMCA notice for Daily.Deals.', alternates: { canonical: '/legal' } }

export default function LegalPage() {
  const year = new Date().getFullYear()
  return (
    <main>
      <PageHero eyebrow="LEGAL" title="Trademark & copyright notice" dek={`© ${year} Webworks. All rights reserved.`} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <Prose sections={[
          { h: 'Trademarks', body: [
            'Daily.Deals™, the Daily.Deals wordmark, “Daily Deals. Every Day.”™, “The Daily Edition”™, “The Daily Draw”™, “Deal Concierge”™, and the Daily Flash, Daily Hot, Daily Clearance, Daily US and Daily Canadian section names are trademarks of Webworks. Use of these marks without written permission is prohibited.',
            'All other trademarks, service marks, product names, logos and retailer names shown on this site are the property of their respective owners. They are used for identification and descriptive purposes only. Their appearance does not imply any affiliation with, sponsorship by, or endorsement of Daily.Deals.',
          ]},
          { h: 'Copyright', body: [
            `The content of this website — including original text, shopping guides, deal descriptions and editorial notes, scoring methodology, page designs, graphics, the selection and arrangement of content, and the underlying software — is © ${year} Webworks and is protected by the copyright laws of the United States, Canada and other countries.`,
            'You may view and share links to our pages and quote brief excerpts with attribution and a link back. You may not reproduce, republish, scrape, frame, distribute or create derivative works from our content, or compile it into a database, without prior written permission.',
            'Product images, videos and third-party content remain the property of their respective owners and are displayed for identification, commentary or by embedding from the original platform.',
          ]},
          { h: 'Domain name', body: ['The domain name daily.deals is owned by Webworks. Inquiries about the website, the domain name, sponsorship, advertising or partnership may be made through the link at the top of every page.'] },
        ]} />
        <section id="dmca">
          <h2 className="font-serif text-2xl text-ink mb-3">Copyright complaints (DMCA)</h2>
          <p className="text-ink-2 leading-relaxed mb-3">We respect intellectual property rights. If you believe material on Daily.Deals infringes your copyright, send a notice using the form below that includes: (1) identification of the copyrighted work; (2) the URL of the material you claim is infringing; (3) your contact information; (4) a statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent or the law; (5) a statement, under penalty of perjury, that the information in your notice is accurate and that you are the owner or authorized to act on the owner’s behalf; and (6) your physical or electronic signature. We will respond promptly and remove material where appropriate.</p>
          <div className="border border-rule p-6 mt-5">
            <SmartForm formType="dmca" submitLabel="Submit notice →" successTitle="Notice received." successBody="We will review your notice and respond by email."
              fields={[
                { name: 'name', label: 'Full legal name', required: true, half: true },
                { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                { name: 'work', label: 'Copyrighted work', required: true },
                { name: 'url', label: 'URL of the material on Daily.Deals', type: 'url', required: true },
                { name: 'message', label: 'Description and good-faith statement', type: 'textarea', required: true, rows: 4 },
                { name: 'signature', label: 'Electronic signature (type your full name)', required: true },
                { name: 'perjury', label: 'I swear, under penalty of perjury, that the information in this notice is accurate and that I am the copyright owner or authorized to act on the owner’s behalf.', type: 'checkbox', required: true },
              ]} />
          </div>
        </section>
      </div>
    </main>
  )
}
