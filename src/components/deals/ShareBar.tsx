'use client'

import { useState } from 'react'

export default function ShareBar({ dealId, title, ogImageUrl }: {
  dealId: number
  title: string
  ogImageUrl: string
}) {
  const [copied, setCopied] = useState(false)
  const dealUrl = `https://daily.deals/deal/${dealId}`
  const shareText = encodeURIComponent(title)
  const encUrl = encodeURIComponent(dealUrl)
  const encImage = encodeURIComponent(ogImageUrl)

  // Pinterest pin description should include hashtags + brand for discoverability
  const pinDesc = encodeURIComponent(`${title} | Find the best daily deals at Daily.Deals #deals #savings #discount`)

  const shares = [
    {
      label: 'Pinterest',
      icon: 'P',
      bg: '#E60023',
      url: `https://pinterest.com/pin/create/button/?url=${encUrl}&media=${encImage}&description=${pinDesc}`,
    },
    {
      label: 'Facebook',
      icon: 'f',
      bg: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    },
    {
      label: 'Twitter',
      icon: '𝕏',
      bg: '#000',
      url: `https://twitter.com/intent/tweet?url=${encUrl}&text=${shareText}`,
    },
    {
      label: 'Reddit',
      icon: 'R',
      bg: '#FF4500',
      url: `https://reddit.com/submit?url=${encUrl}&title=${shareText}`,
    },
    {
      label: 'WhatsApp',
      icon: 'W',
      bg: '#25D366',
      url: `https://wa.me/?text=${shareText}%20${encUrl}`,
    },
    {
      label: 'Email',
      icon: '✉',
      bg: '#666',
      url: `mailto:?subject=${shareText}&body=Check out this deal: ${encUrl}`,
    },
  ]

  function copyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(dealUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  function nativeShare() {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      ;(navigator as any).share({ title, url: dealUrl }).catch(() => {})
    } else {
      copyLink()
    }
  }

  return (
    <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Share This Deal</h3>
        <button onClick={nativeShare}
          className="text-brand-red hover:text-white text-xs font-medium md:hidden">
          📤 Quick share
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {shares.map(s => (
          <a key={s.label}
             href={s.url}
             target="_blank"
             rel="noopener noreferrer"
             title={`Share to ${s.label}`}
             className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black
                        text-base hover:scale-110 transition-transform shadow-md"
             style={{ background: s.bg }}>
            {s.icon}
          </a>
        ))}

        <button onClick={copyLink}
          className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold
                     uppercase tracking-wider transition-colors flex items-center gap-2">
          {copied ? '✓ Copied' : '🔗 Copy link'}
        </button>
      </div>

      <p className="text-brand-gray text-[11px] mt-3">
        💡 Pinterest pins drive 10x more deal traffic than other channels — start there.
      </p>
    </div>
  )
}
