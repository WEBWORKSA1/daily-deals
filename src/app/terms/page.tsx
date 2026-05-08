import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Terms of Service | Daily.Deals' }

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Legal</span>
        <h1 className="font-heading text-5xl font-900 text-white uppercase mt-2 mb-2">Terms of Service</h1>
        <p className="text-brand-gray text-sm mb-10">Last updated: May 2026</p>
        <div className="space-y-6 text-brand-gray-2 leading-relaxed text-sm">
          {[
            ['Acceptance of Terms', 'By using Daily.Deals, you agree to these terms. If you do not agree, please do not use our service.'],
            ['Service Description', 'Daily.Deals aggregates publicly available deal information from retailers and affiliate networks. We do not sell products directly. All purchases are made through third-party retailers.'],
            ['Deal Accuracy', 'We strive to keep deal information accurate and up to date. However, prices and availability can change rapidly. Always verify the final price at the retailer before purchasing.'],
            ['User Conduct', 'You agree not to misuse our service, including attempting to scrape our site, submit false deals, or use our affiliate links in unauthorized ways.'],
            ['Limitation of Liability', 'Daily.Deals is not responsible for purchases made through our affiliate links. All sales are between you and the third-party retailer.'],
            ['Changes to Terms', 'We may update these terms from time to time. Continued use of Daily.Deals after changes constitutes acceptance of the new terms.'],
          ].map(([title, text]) => (
            <div key={title} className="bg-brand-dark-3 border border-white/10 rounded-xl p-6">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-3">{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
