import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Privacy Policy | Daily.Deals' }

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Legal</span>
        <h1 className="font-heading text-5xl font-900 text-white uppercase mt-2 mb-2">Privacy Policy</h1>
        <p className="text-brand-gray text-sm mb-10">Last updated: May 2026</p>
        <div className="space-y-8 text-brand-gray-2 leading-relaxed text-sm">
          {[
            ['Information We Collect', 'We collect minimal information to provide our service. This includes your approximate location (city/region level) when you use our location features, your email address if you subscribe to our newsletter, and anonymous usage data such as which deals are clicked.'],
            ['How We Use Information', 'Location data is used solely to show you relevant local and regional deals. Email addresses are used only to send our daily deal newsletter. We never sell your personal information to third parties.'],
            ['Cookies', 'We use cookies to remember your location preferences and to serve relevant advertisements through Google AdSense. You can disable cookies in your browser settings, though some features may not work correctly.'],
            ['Affiliate Links', 'Many links on Daily.Deals are affiliate links. When you click these and make a purchase, we may earn a commission. This does not affect the price you pay.'],
            ['Third-Party Services', 'We use Google AdSense for advertising and Google Analytics for anonymous traffic analysis. These services have their own privacy policies.'],
            ['Contact', 'For privacy-related questions, contact us at privacy@daily.deals'],
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
