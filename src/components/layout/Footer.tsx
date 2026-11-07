import Link from 'next/link'
import { FOOTER_COLUMNS, SITE_NAME, OWNER_NAME, INQUIRY_URL } from '@/lib/site'
import FooterSubscribe from './FooterSubscribe'
import { CookieSettingsLink } from './ConsentBanner'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <>
      <section className="bg-ink text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[11px] tracking-[0.25em] text-white/60 mb-3">THE DAILY EDITION · DELIVERED</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white mb-3">Daily Deals. In your inbox.</h2>
            <p className="text-sm text-white/70 max-w-md">One short email each morning with the top ten deals of the day, plus giveaway reminders. Free. Unsubscribe in one click.</p>
          </div>
          <FooterSubscribe />
        </div>
      </section>

      <footer className="bg-white border-t border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="wordmark text-xl text-ink mb-3">Daily<span className="dot">.</span>Deals</div>
              <p className="text-ink-2 text-sm leading-relaxed mb-4">
                An automated, editor-designed deal desk for shoppers in the US and Canada. Fresh deals every day, ranked by real savings.
              </p>
              <a href={INQUIRY_URL} target="_blank" rel="noopener" className="text-xs text-accent hover:underline">
                Interested in this website or domain? Contact →
              </a>
            </div>
            {FOOTER_COLUMNS.map(col => (
              <div key={col.title}>
                <div className="section-eyebrow mb-4">{col.title.toUpperCase()}</div>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={href}><Link href={href} className="text-ink-2 hover:text-ink text-sm transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-rule">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
            <p className="text-ink-muted text-[11px] leading-relaxed">
              <strong className="text-ink-2 font-medium">Trademark &amp; copyright notice.</strong>{' '}
              {SITE_NAME}™ and the {SITE_NAME} wordmark are trademarks of {OWNER_NAME}. © {year} {OWNER_NAME}. All rights reserved.
              Original text, design, scoring methodology, guides and compilation on this site are protected by copyright and may not be reproduced without permission.
              All other product names, logos, brands and retailer names are the property of their respective owners and are used for identification only; their use does not imply endorsement.
              Prices and availability are set by retailers and can change at any time — confirm the final price at checkout.{' '}
              <Link href="/legal" className="text-ink underline">Full notice</Link>
            </p>
            <p className="text-ink-muted text-[11px] leading-relaxed">
              <strong className="text-ink-2 font-medium">Affiliate disclosure.</strong> {SITE_NAME} is reader-supported. When you buy through links on our site we may earn a commission, at no extra cost to you.
              As an Amazon Associate we earn from qualifying purchases. <Link href="/disclosure" className="text-ink underline">Learn more</Link>
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-muted pt-1">
              <span>© {year} {OWNER_NAME}</span>
              <Link href="/privacy" className="hover:text-ink">Privacy</Link>
              <Link href="/terms" className="hover:text-ink">Terms</Link>
              <Link href="/legal#dmca" className="hover:text-ink">DMCA</Link>
              <CookieSettingsLink className="hover:text-ink" />
              <span className="tracking-widest ml-auto">UPDATED CONTINUOUSLY</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
