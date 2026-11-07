import { Metadata } from 'next'
import { PageHero, Prose } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Daily.Deals collects, uses and protects information, including cookies, Google advertising, affiliate links, newsletters, forms and your privacy choices.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main>
      <PageHero eyebrow="LEGAL" title="Privacy Policy" dek="Last updated: November 7, 2026. This policy explains what information Daily.Deals collects, how we use it, and the choices you have." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Prose sections={[
          { h: 'Who we are', body: ['Daily.Deals (“we”, “us”) is operated by Webworks. This policy applies to daily.deals and its subpages. To contact us about privacy, use the form on our Contact page and choose the most relevant topic.'] },
          { h: 'Information we collect', body: [
            '- Information you give us: when you subscribe, request a price watch, enter a giveaway, apply for a role, submit a deal or contact us, we collect what you enter — typically your name, email address, country, region and message.',
            '- Account information: if you create an account, we store your email address, preferences, saved deals, votes and comments.',
            '- Automatically collected information: like most websites, our servers and service providers receive standard technical data such as IP address, browser type, device information, pages viewed, referring pages and the time of your visit. We store a one-way hash of IP addresses with form submissions to prevent abuse.',
            '- Location: we may estimate your general location (city, state or province) from your IP address, or use a ZIP or postal code you provide, to show relevant deals. We do not collect precise GPS location.',
          ]},
          { h: 'How we use information', body: [
            '- To operate the site, show relevant deals, and remember your settings.',
            '- To send newsletters, deal alerts and Deal Concierge matches you asked for.',
            '- To administer giveaways, review applications and respond to messages.',
            '- To measure and improve the site, prevent fraud and spam, and keep the service secure.',
            '- To show advertising and earn affiliate commissions, as described below.',
            'We do not sell your personal information. We do not share your email address with advertisers.',
          ]},
          { h: 'Cookies and similar technologies', body: [
            'We use cookies and local storage to keep you signed in, remember your location and consent choices, and understand how the site is used. Advertising and affiliate partners also use cookies, as described below. You can control cookies through your browser settings and our Cookie settings link in the footer; blocking some cookies may affect how the site works.',
          ]},
          { h: 'Google advertising', body: [
            'We use Google AdSense to display ads. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.',
            'Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the Internet.',
            'You may opt out of personalized advertising by visiting Google Ads Settings (adssettings.google.com). You can also opt out of some third-party vendors’ use of cookies for personalized advertising at aboutads.info/choices (US) or youradchoices.ca (Canada). To learn how Google uses information from sites that use its services, see policies.google.com/technologies/partner-sites.',
            'Where required by law — including for visitors in the European Economic Area, the UK and Switzerland — we ask for your consent before personalized ads are shown, using Google Consent Mode and a consent message.',
          ]},
          { h: 'Affiliate links', body: ['Many links on Daily.Deals are affiliate links (for example, through Amazon Associates and Skimlinks). When you click one, the retailer or network may set a cookie to attribute a purchase to us, and we may receive a commission. We receive aggregate reports — not your payment details. Retailers’ own privacy policies apply once you leave our site.'] },
          { h: 'Embedded content', body: ['Videos are embedded from YouTube using privacy-enhanced mode, which does not load YouTube until you press play. Once you play a video, YouTube’s privacy policy applies.'] },
          { h: 'Service providers', body: ['We use trusted providers to host the site, store data, send email, process payments for voluntary contributions and deliver form submissions. They may process information on our behalf only to provide their services. Payments are handled entirely by the payment provider; we never receive full card numbers.'] },
          { h: 'Data retention', body: ['We keep personal information only as long as needed for the purposes above — for example, until you unsubscribe, delete your account, or a giveaway and any legal retention period end — and then delete or anonymize it.'] },
          { h: 'Your rights and choices', body: [
            '- Unsubscribe from any email using the link at the bottom of the message.',
            '- Ask us to access, correct or delete your personal information using our Contact page.',
            '- California residents have rights under the CCPA/CPRA, including to know, delete, correct and opt out of the sale or sharing of personal information. We do not sell personal information.',
            '- Canadian residents have rights under PIPEDA and applicable provincial laws, including access and correction.',
            '- Visitors in the EEA, UK and Switzerland have rights under the GDPR, including access, rectification, erasure, restriction, portability and objection, and the right to withdraw consent at any time.',
          ]},
          { h: 'Children', body: ['Daily.Deals is not directed to children under 13 (or under 16 where applicable), and we do not knowingly collect their personal information. Giveaways are open only to adults.'] },
          { h: 'Security', body: ['We use encryption in transit, access controls and reputable providers to protect information. No method of transmission or storage is completely secure.'] },
          { h: 'Changes', body: ['We may update this policy as our services change. The “last updated” date above shows when it was last revised.'] },
        ]} />
        <div id="cookies" />
      </div>
    </main>
  )
}
