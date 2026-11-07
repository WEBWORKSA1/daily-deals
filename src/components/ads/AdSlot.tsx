'use client'
import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT } from '@/lib/site'

declare global { interface Window { adsbygoogle?: unknown[] } }

const SLOTS: Record<string, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  infeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
}

// Manual AdSense unit. Renders nothing until a slot ID is configured — until then,
// Auto ads (enabled by the site-wide script in <head>) choose placements automatically.
export default function AdSlot({ kind = 'leaderboard', className = '' }: { kind?: keyof typeof SLOTS; className?: string }) {
  const slot = SLOTS[kind]
  const pushed = useRef(false)
  useEffect(() => {
    if (!slot || pushed.current) return
    pushed.current = true
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch {}
  }, [slot])
  if (!slot) return null
  return (
    <div className={`my-8 ${className}`} aria-label="Advertisement">
      <div className="text-[9px] tracking-[0.2em] text-ink-faint text-center mb-1">ADVERTISEMENT</div>
      <ins className="adsbygoogle block" style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT} data-ad-slot={slot}
        data-ad-format={kind === 'article' ? 'fluid' : 'auto'} data-ad-layout={kind === 'article' ? 'in-article' : undefined}
        data-full-width-responsive="true" />
    </div>
  )
}
