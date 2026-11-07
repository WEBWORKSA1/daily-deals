import { Metadata } from 'next'
import { PageHero, Prose } from '@/components/ui/Editorial'

export const metadata: Metadata = { title: 'Terms of Use', description: 'The terms that govern your use of Daily.Deals.', alternates: { canonical: '/terms' } }

export default function TermsPage() {
  return (
    <main>
      <PageHero eyebrow="LEGAL" title="Terms of Use" dek="Last updated: November 7, 2026. By using Daily.Deals you agree to these terms." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Prose sections={[
          { h: '1. About the service', body: ['Daily.Deals, operated by Webworks, publishes information about deals, coupons and prices offered by third-party retailers, along with original shopping guides and tools. We are not a retailer: we do not sell products, process orders or handle shipping or returns.'] },
          { h: '2. Prices and availability', body: ['Prices, discounts, coupon codes, availability and terms are set by retailers and can change at any time without notice. Information on Daily.Deals may be delayed or inaccurate. Always confirm the final price and terms on the retailer’s site before buying. We are not responsible for retailer pricing errors, stock, products or service.'] },
          { h: '3. Affiliate relationships', body: ['Some links are affiliate links, and we may earn a commission when you make a purchase. See our Affiliate Disclosure.'] },
          { h: '4. Accounts and community content', body: ['You are responsible for activity on your account. If you submit deals, comments or other content, you confirm you have the right to share it and grant us a non-exclusive, worldwide, royalty-free licence to display, edit and distribute it on our services. Do not post content that is unlawful, misleading, infringing, spammy, abusive or that promotes referral or affiliate links for your own gain. We may remove content or suspend accounts at our discretion.'] },
          { h: '5. Giveaways and contributions', body: ['Giveaways are governed by their Official Rules. Voluntary contributions support an independent publication; they are not purchases of goods or services, are generally non-refundable, and are not tax-deductible.'] },
          { h: '6. Intellectual property', body: ['The Daily.Deals name, wordmark, design, original text, guides, scoring methodology and compilation are owned by Webworks and protected by trademark and copyright law. You may share links and brief quotations with attribution. You may not copy, scrape, republish or create derivative databases from the site without written permission. Third-party trademarks belong to their owners.'] },
          { h: '7. Acceptable use', body: ['Do not attempt to disrupt the site, access it with automated tools in a way that burdens our systems, circumvent security, or use it for unlawful purposes.'] },
          { h: '8. Disclaimers', body: ['The service is provided “as is” and “as available” without warranties of any kind, to the fullest extent permitted by law. Guides are general information, not financial or legal advice.'] },
          { h: '9. Limitation of liability', body: ['To the fullest extent permitted by law, Webworks is not liable for indirect, incidental, special or consequential damages, or for any loss arising from purchases you make from third parties. Our total liability for any claim relating to the service is limited to USD $100.'] },
          { h: '10. Changes and contact', body: ['We may update these terms; continued use means you accept the updated terms. Questions? Use our Contact page.'] },
        ]} />
      </div>
    </main>
  )
}
