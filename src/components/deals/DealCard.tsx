'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Deal } from '@/types'
import { formatPrice, getTimeRemaining } from '@/lib/utils'
import { hotnessTier } from '@/lib/hotness'

export default function DealCard({ deal, initialUserVote, initialIsSaved }: {
  deal: Deal
  initialUserVote?: number | null
  initialIsSaved?: boolean
}) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [clicking, setClicking] = useState(false)
  const [userVote, setUserVote] = useState<number | null>(initialUserVote ?? null)
  const [upvotes, setUpvotes] = useState((deal as any).upvote_count || 0)
  const [downvotes, setDownvotes] = useState((deal as any).downvote_count || 0)
  const [isSaved, setIsSaved] = useState(initialIsSaved ?? false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    if (!deal.expires_at) return
    const tick = () => setTimeLeft(getTimeRemaining(deal.expires_at!))
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [deal.expires_at])

  // Card click → goes to deal detail page
  function handleCardClick() {
    router.push(`/deal/${deal.id}`)
  }

  // Get Deal button → tracks click, requests cashback link if signed in, opens
  async function handleGetDeal(e: React.MouseEvent) {
    e.stopPropagation()
    if (clicking) return
    setClicking(true)

    let urlToOpen = deal.affiliate_url

    // Try to get a cashback-tagged URL (silently falls back to plain URL if not signed in)
    try {
      const res = await fetch('/api/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deal_id: deal.id }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.affiliate_url) urlToOpen = json.affiliate_url
      }
    } catch {}

    // Always log the click for analytics
    try {
      await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: deal.id })
      })
    } catch {}

    window.open(urlToOpen, '_blank', 'noopener,noreferrer')
    setClicking(false)
  }

  async function handleVote(v: 1 | -1, e: React.MouseEvent) {
    e.stopPropagation()
    const newVote = userVote === v ? 0 : v
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: deal.id, vote: newVote }),
      })
      if (res.status === 401) { setAuthError(true); setTimeout(() => setAuthError(false), 2500); return }
      const json = await res.json()
      if (json.success) {
        setUpvotes(json.upvotes); setDownvotes(json.downvotes)
        setUserVote(newVote === 0 ? null : newVote)
      }
    } catch {}
  }

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      if (isSaved) {
        const res = await fetch(`/api/saves?deal_id=${deal.id}`, { method: 'DELETE' })
        if (res.ok) setIsSaved(false)
        else if (res.status === 401) { setAuthError(true); setTimeout(() => setAuthError(false), 2500) }
      } else {
        const res = await fetch('/api/saves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deal_id: deal.id }),
        })
        if (res.ok) setIsSaved(true)
        else if (res.status === 401) { setAuthError(true); setTimeout(() => setAuthError(false), 2500) }
      }
    } catch {}
  }

  const discount = deal.discount_percent || (deal.original_price
    ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
    : 0)
  const savings = deal.original_price ? deal.original_price - deal.deal_price : null

  const score = deal.hotness_score || 0
  const tier = score >= 45 ? hotnessTier(score) : null
  const netVotes = upvotes - downvotes

  return (
    <div className="deal-card card-shine group cursor-pointer relative" onClick={handleCardClick}>
      {/* SAVE button */}
      <button onClick={handleSave}
        className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center
                    backdrop-blur-md transition-all ${
                      isSaved
                        ? 'bg-brand-red text-white shadow-glow'
                        : 'bg-black/60 text-white/80 hover:bg-brand-red/80 hover:text-white'
                    }`}
        title={isSaved ? 'Saved' : 'Save deal'}>
        🔖
      </button>

      {/* IMAGE */}
      <div className="relative bg-brand-dark-4 h-44 overflow-hidden flex-shrink-0">
        {deal.image_url ? (
          <img src={deal.image_url} alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 text-5xl">🛍️</div>
        )}

        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-brand-red text-white text-xs font-black
                          px-2.5 py-1 rounded-md uppercase tracking-wider shadow-glow">
            -{discount}%
          </div>
        )}

        {tier ? (
          <div className="absolute top-12 right-2 text-xs font-black uppercase tracking-wider
                          px-2 py-1 rounded-md shadow-md flex items-center gap-1"
               style={{ background: tier.color, color: tier.textColor }}>
            <span>{tier.emoji}</span>
            <span>{tier.label}</span>
          </div>
        ) : (
          <div className="absolute top-12 right-2">
            {deal.deal_type === 'flash'     && <span className="badge-flash">⚡ Flash</span>}
            {deal.deal_type === 'clearance' && <span className="badge-clear">Clearance</span>}
          </div>
        )}

        {deal.is_editors_choice && (
          <div className="absolute top-10 left-2 bg-gradient-to-r from-yellow-500 to-amber-400
                          text-black text-xs font-black px-2 py-1 rounded-md
                          uppercase tracking-wider shadow-md flex items-center gap-1">
            <span>⭐</span><span>Editor's Pick</span>
          </div>
        )}

        {(deal.is_verified || (deal.click_count || 0) >= 5) && !deal.is_editors_choice && (
          <div className="absolute top-10 left-2 bg-brand-green/90 text-white
                          text-xs font-bold px-2 py-1 rounded-md
                          flex items-center gap-1 shadow-md">
            <span>✓</span><span>Verified</span>
          </div>
        )}

        {deal.retailer_name && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm
                          text-white text-xs font-bold px-2 py-1 rounded-md">
            {deal.retailer_name}
          </div>
        )}

        <div className="absolute bottom-2 right-2 text-base">
          {deal.country === 'CA' ? '🇨🇦' : '🇺🇸'}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-3
                       group-hover:text-brand-red transition-colors">
          {deal.title}
        </h3>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-900 text-brand-red leading-none">
              {formatPrice(deal.deal_price, deal.country)}
            </span>
            {deal.original_price && (
              <span className="text-brand-gray text-sm line-through">
                {formatPrice(deal.original_price, deal.country)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {savings && savings > 0 ? (
              <span className="text-brand-green text-xs font-bold">
                Save {formatPrice(savings, deal.country)}
              </span>
            ) : <span />}
            {deal.coupon_code && (
              <span className="text-brand-gold text-xs font-mono bg-brand-gold/10
                               border border-brand-gold/30 px-2 py-0.5 rounded tracking-wider">
                {deal.coupon_code}
              </span>
            )}
          </div>

          {timeLeft && (
            <div className="text-xs text-brand-red timer-pulse font-medium">⏱ Ends in {timeLeft}</div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <button onClick={e => handleVote(1, e)}
                className={`px-1.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  userVote === 1 ? 'bg-brand-green text-white' : 'bg-white/5 text-brand-gray hover:bg-white/10'
                }`}>▲</button>
              <span className={`font-mono text-xs ${
                netVotes > 0 ? 'text-brand-green' : netVotes < 0 ? 'text-brand-red' : 'text-brand-gray'
              }`}>{netVotes > 0 ? `+${netVotes}` : netVotes}</span>
              <button onClick={e => handleVote(-1, e)}
                className={`px-1.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  userVote === -1 ? 'bg-brand-red text-white' : 'bg-white/5 text-brand-gray hover:bg-white/10'
                }`}>▼</button>
            </div>

            {tier && (
              <div className="flex items-center gap-1 flex-1 ml-2">
                <div className="flex-1 h-1 bg-brand-dark-4 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-500"
                       style={{ width: `${score}%`, background: tier.color }} />
                </div>
                <span className="text-brand-gray font-mono text-[10px]">{score}</span>
              </div>
            )}
          </div>

          {authError && (
            <div className="text-brand-red text-[10px] text-center py-1">
              Sign in to save / vote →
            </div>
          )}

          <button onClick={handleGetDeal} disabled={clicking}
            className="w-full bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white
                       border border-brand-red/30 hover:border-brand-red
                       text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg
                       transition-all duration-150 flex items-center justify-center gap-1.5">
            {clicking ? 'Opening...' : 'Get Deal →'}
          </button>
        </div>
      </div>
    </div>
  )
}
