import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-brand-dark-2 border-t border-white/8 mt-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔥</span>
              <span className="font-heading text-xl font-900 text-white uppercase tracking-tight">
                DAILY<span className="text-brand-red">.</span>DEALS
              </span>
            </div>
            <p className="text-brand-gray text-sm leading-relaxed mb-4">
              The best daily deals from 1,000+ US & Canadian retailers. Updated every 24 hours. Always free.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-brand-dark-4 border border-white/8 text-brand-gray-2 px-3 py-1.5 rounded-full">🇺🇸 United States</span>
              <span className="text-xs bg-brand-dark-4 border border-white/8 text-brand-gray-2 px-3 py-1.5 rounded-full">🇨🇦 Canada</span>
            </div>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-4">Deals</h3>
            <ul className="space-y-2.5">
              {[["Today's Deals",'/deals/today'],['Flash Deals','/deals/flash'],['US Deals','/deals/us'],['Canadian Deals','/deals/canada'],['Clearance','/deals/clearance']].map(([label,href])=>(
                <li key={href}><Link href={href} className="text-brand-gray hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {[['Electronics','/category/electronics'],['Fashion','/category/fashion'],['Home & Kitchen','/category/home-kitchen'],['Sports','/category/sports-outdoors'],['Gaming','/category/gaming'],['Beauty','/category/beauty']].map(([label,href])=>(
                <li key={href}><Link href={href} className="text-brand-gray hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[['About Us','/about'],['Contact','/contact'],['Submit a Deal','/submit'],['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Affiliate Disclosure','/disclosure']].map(([label,href])=>(
                <li key={href}><Link href={href} className="text-brand-gray hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-brand-gray text-xs">© {year} Daily.Deals — All rights reserved.</p>
          <p className="text-brand-gray text-xs text-center">
            We may earn affiliate commissions when you click on deals.{' '}
            <Link href="/disclosure" className="text-brand-gray-2 hover:text-white transition-colors underline">Disclosure</Link>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-brand-gray">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            <span>Updated daily</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
