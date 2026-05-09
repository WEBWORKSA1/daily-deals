'use client'

import { useState } from 'react'

export default function GetDealButton({
  dealId,
  fallbackUrl,
  retailerName,
  className,
}: {
  dealId: number
  fallbackUrl: string
  retailerName: string
  className?: string
}) {
  const [clicking, setClicking] = useState(false)
  const [cashbackInfo, setCashbackInfo] = useState<{ rate: number; eligible: boolean } | null>(null)

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    if (clicking) return
    setClicking(true)

    let urlToOpen = fallbackUrl

    // 1) Hit cashback endpoint — for signed-in users it returns a tagged URL + creates a pending event
    try {
      const cashRes = await fetch('/api/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deal_id: dealId }),
      })
      if (cashRes.ok) {
        const j = await cashRes.json()
        if (j.affiliate_url) urlToOpen = j.affiliate_url
        if (j.cashback_eligible !== undefined) {
          setCashbackInfo({ rate: j.cashback_rate || 0, eligible: !!j.cashback_eligible })
        }
      }
    } catch {}

    // 2) Log the click
    try {
      const clickRes = await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId }),
      })
      if (clickRes.ok) {
        const j = await clickRes.json()
        if (j.url) urlToOpen = j.url
      }
    } catch {}

    window.open(urlToOpen, '_blank', 'noopener,noreferrer')
    setClicking(false)
  }

  return (
    <>
      <a href={fallbackUrl} onClick={handleClick}
         target="_blank" rel="noopener noreferrer"
         className={className || `block w-full bg-brand-red hover:bg-red-600 text-white text-center
                                   font-bold uppercase tracking-wider py-4 rounded-lg shadow-glow transition-all`}>
        {clicking ? 'Opening…' : `Get This Deal at ${retailerName} →`}
      </a>
      <p className="text-brand-gray text-[10px] text-center mt-2">
        Affiliate link · We may earn commission at no extra cost to you
        {cashbackInfo?.eligible && cashbackInfo.rate > 0 && (
          <> · <span className="text-brand-green font-bold">{cashbackInfo.rate}% cashback</span> credited after purchase confirms</>
        )}
      </p>
    </>
  )
}
