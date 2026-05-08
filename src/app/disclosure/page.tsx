import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Affiliate Disclosure | Daily.Deals' }

export default function DisclosurePage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Legal</span>
        <h1 className="font-heading text-5xl font-900 text-white uppercase mt-2 mb-2">Affiliate Disclosure</h1>
        <p className="text-brand-gray text-sm mb-10">Last updated: May 2026</p>
        <div className="space-y-6 text-brand-gray-2 leading-relaxed text-sm">
          <div className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-6">
            <p className="text-white font-semibold">Daily.Deals participates in affiliate marketing programs. We may earn commissions when you click on deal links and make a purchase — at no additional cost to you.</p>
          </div>
          {[
            ['Amazon Associates', 'Daily.Deals is a participant in the Amazon Services LLC Associates Program and Amazon.ca Associates Program, affiliate advertising programs designed to provide a means to earn fees by linking to Amazon.com and Amazon.ca.'],
            ['Other Affiliate Programs', 'We also participate in affiliate programs with CJ Affiliate, ShareASale, Impact, and direct retailer programs. These programs pay us a small commission on qualifying purchases.'],
            ['Editorial Independence', 'Our affiliate relationships do not influence which deals we feature. We feature deals based on their value to our users — discount percentage, retailer reputation, and deal quality.'],
            ['FTC Compliance', 'In accordance with FTC guidelines, we disclose that many links on Daily.Deals are affiliate links. This disclosure applies site-wide to all deal links.'],
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
