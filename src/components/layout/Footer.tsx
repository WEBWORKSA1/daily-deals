import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <>
      {/* NEWSLETTER BLOCK \u2014 high contrast editorial close */}
      <section className="bg-ink text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="text-[11px] tracking-[0.25em] text-ink-muted mb-3">THE DAILY DEAL \u00B7 DELIVERED</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white mb-3">
            Daily Deals. In your inbox.
          </h2>
          <p className="text-sm text-ink-faint max-w-md mx-auto mb-6">
            One email each morning. The day\u2019s best deals, hand-picked. Free.
          </p>
          <form className="flex justify-center gap-2 max-w-md mx-auto">
            <input type="email" placeholder="you@email.com"
              className="flex-1 bg-white/5 border border-white/15 text-white placeholder-white/40
                         rounded px-4 py-3 text-sm focus:outline-none focus:border-white" />
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white font-medium px-5 py-3 rounded text-sm">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-white border-t border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="wordmark text-xl text-ink mb-3">
                Daily<span className="dot">.</span>Deals
              </div>
              <p className="text-ink-2 text-sm leading-relaxed mb-4">
                Hand-picked discounts from 1,000+ retailers across the US and Canada. Updated every 24 hours.
              </p>
              <div className="flex gap-3 text-[11px] text-ink-muted tracking-wider">
                <span>43,140 ZIPS COVERED</span>
              </div>
            </div>
            <div>
              <div className="section-eyebrow mb-4">DAILY DEALS</div>
              <ul className="space-y-2.5">
                {[["Daily Hot Deals",'/deals/hot'],['Daily Flash Deals','/deals/flash'],['Daily Clearance','/deals/clearance'],['Daily US Deals','/deals/us'],['Daily Canadian Deals','/deals/canada']].map(([label,href])=>(
                  <li key={href}><Link href={href} className="text-ink-2 hover:text-ink text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="section-eyebrow mb-4">CATEGORIES</div>
              <ul className="space-y-2.5">
                {[['Electronics','/category/electronics'],['Fashion','/category/fashion'],['Home &amp; Kitchen','/category/home-kitchen'],['Sports','/category/sports-outdoors'],['Gaming','/category/gaming'],['Beauty','/category/beauty']].map(([label,href])=>(
                  <li key={href}><Link href={href as string} className="text-ink-2 hover:text-ink text-sm transition-colors" dangerouslySetInnerHTML={{__html: label as string}} /></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="section-eyebrow mb-4">COMPANY</div>
              <ul className="space-y-2.5">
                {[['About','/about'],['Contact','/contact'],['Submit a Deal','/submit'],['Privacy','/privacy'],['Terms','/terms'],['Affiliate Disclosure','/disclosure']].map(([label,href])=>(
                  <li key={href}><Link href={href} className="text-ink-2 hover:text-ink text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-rule">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-ink-muted text-xs">\u00A9 {year} Daily.Deals \u2014 All rights reserved.</p>
            <p className="text-ink-muted text-xs text-center">
              We may earn affiliate commissions when you click on deals.{' '}
              <Link href="/disclosure" className="text-ink hover:underline">Disclosure</Link>
            </p>
            <p className="text-ink-muted text-[11px] tracking-widest">UPDATED DAILY</p>
          </div>
        </div>
      </footer>
    </>
  )
}
