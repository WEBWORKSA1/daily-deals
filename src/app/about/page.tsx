import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'About Daily.Deals' }

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <span className="text-brand-red text-xs font-bold uppercase tracking-widest">About Us</span>
          <h1 className="font-heading text-5xl font-900 text-white uppercase mt-2 mb-4">We Find the Deals.<br />You Save the Money.</h1>
          <p className="text-brand-gray text-lg leading-relaxed">Daily.Deals is a deal aggregation platform covering the best discounts, coupons, and price drops from 1,000+ retailers across the United States and Canada — updated every 24 hours.</p>
        </div>
        <div className="space-y-8 text-brand-gray-2 leading-relaxed">
          <div className="bg-brand-dark-3 border border-white/10 rounded-xl p-6">
            <h2 className="font-heading text-2xl font-bold text-white uppercase mb-3">Our Mission</h2>
            <p>We believe everyone deserves access to the best prices. Our platform aggregates deals from major US and Canadian retailers so you never overpay for anything — whether you're shopping online or in-store.</p>
          </div>
          <div className="bg-brand-dark-3 border border-white/10 rounded-xl p-6">
            <h2 className="font-heading text-2xl font-bold text-white uppercase mb-3">How It Works</h2>
            <p>Our team and automated systems collect deals from retailers daily. Every deal shows the original price, sale price, discount percentage, and where to buy. When you click a deal, we may earn a small affiliate commission — at no cost to you.</p>
          </div>
          <div className="bg-brand-dark-3 border border-white/10 rounded-xl p-6">
            <h2 className="font-heading text-2xl font-bold text-white uppercase mb-3">US & Canada</h2>
            <p>We're one of the few deal platforms covering both the United States and Canada. Deals are clearly marked by country and we detect your location to show the most relevant deals first.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
