'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const KEY = 'dd_consent_v1'

declare global { interface Window { gtag?: (...a: any[]) => void; dataLayer?: any[] } }

function update(granted: boolean) {
  const v = granted ? 'granted' : 'denied'
  window.gtag?.('consent', 'update', { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v })
}

// Lightweight consent prompt wired to Google Consent Mode v2.
// For EEA/UK/CH traffic, also enable Google's certified CMP in AdSense → Privacy & messaging.
export default function ConsentBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY)
      if (v) update(v === 'granted')
      else setShow(true)
    } catch { setShow(true) }
    const open = () => setShow(true)
    window.addEventListener('dd:open-consent', open)
    return () => window.removeEventListener('dd:open-consent', open)
  }, [])
  function choose(granted: boolean) {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied') } catch {}
    update(granted)
    setShow(false)
  }
  if (!show) return null
  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-ink shadow-card-hover">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center gap-3">
        <p className="text-xs text-ink-2 flex-1 leading-relaxed">
          We use cookies to keep Daily.Deals free: to remember your settings, measure traffic, and show ads from Google and its partners, which may be personalized.
          Affiliate links may also set cookies. See our <Link href="/privacy#cookies" className="underline text-ink">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => choose(false)} className="btn-outline !py-2">Essential only</button>
          <button onClick={() => choose(true)} className="btn-primary !py-2">Accept all</button>
        </div>
      </div>
    </div>
  )
}

export function CookieSettingsLink({ className = '' }: { className?: string }) {
  return <button type="button" onClick={() => window.dispatchEvent(new Event('dd:open-consent'))} className={className}>Cookie settings</button>
}
