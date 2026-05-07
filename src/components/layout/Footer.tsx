import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-brand-orange text-xl">🔥</span>
              <span className="font-heading text-white font-bold">Daily.Deals</span>
            </div>
            <p className="text-xs leading-relaxed">Today&apos;s best deals from 1000+ top retailers across the US and Canada. Updated every 24 hours.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Deals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/deals/today"     className="hover:text-white transition-colors">Today&apos;s Deals</Link></li>
              <li><Link href="/deals/flash"     className="hover:text-white transition-colors">Flash Deals</Link></li>
              <li><Link href="/deals/clearance" className="hover:text-white transition-colors">Clearance</Link></li>
              <li><Link href="/coupons"         className="hover:text-white transition-colors">Coupons</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Stores</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/store/amazon"        className="hover:text-white transition-colors">Amazon</Link></li>
              <li><Link href="/store/walmart"       className="hover:text-white transition-colors">Walmart</Link></li>
              <li><Link href="/store/amazon-ca"     className="hover:text-white transition-colors">Amazon Canada</Link></li>
              <li><Link href="/store/canadian-tire" className="hover:text-white transition-colors">Canadian Tire</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about"                className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact"              className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/advertise"            className="hover:text-white transition-colors">Advertise</Link></li>
              <li><Link href="/privacy"              className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} Daily.Deals. All rights reserved.</p>
          <p className="text-center max-w-lg opacity-70">Daily.Deals is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.</p>
        </div>
      </div>
    </footer>
  )
}
