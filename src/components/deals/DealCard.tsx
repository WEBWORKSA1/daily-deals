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

  function handleCardClick() {
    router.push(`/deal/${deal.id}`)
  }

  async function handleGetDeal(e: React.MouseEvent) {
    e.stopPropagation()
    if (clicking) return
    setClicking(true)

    let urlToOpen = deal.affiliate_url

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
    <div className="deal-card group cursor-pointer relative" onClick={handleCardClick}>
      {/* SAVE button — minimal, top-right */}
      <button onClick={handleSave}
        className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
          isSaved
            ? 'bg-ink text-white'
            : 'bg-white/90 text-ink-2 border border-rule hover:bg-ink hover:text-white'
        }`}
        title={isSaved ? 'Saved' : 'Save deal'}>
        {isSaved ? '★' : '☆'}
      </button>

      {/* IMAGE */}
      <div className="relative bg-paper-2 aspect-square overflow-hidden flex-shrink-0 border-b border-rule">
        {deal.image_url ? (
          <img src={deal.image_url} alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-xs tracking-widest">
            DAILY DEAL
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-2 left-2 badge-discount">
            -{discount}%
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* EYEBROW: CATEGORY · RETAILER */}
        <div className="badge-eyebrow mb-2 truncate">
          {deal.retailer_name || 'RETAILER'}
        </div>

        <h3 className="text-ink text-sm font-medium leading-snug line-clamp-2 mb-3">
          {deal.title}
        </h3>

        <div className="mt-auto space-y-2.5">
          {/* PRICE ROW */}
          <div className="flex items-baseline gap-2">
            <span className="price-now">
              {formatPrice(deal.deal_price, deal.country)}
            </span>
            {deal.original_price && (
              <span className="price-was">
                {formatPrice(deal.original_price, deal.country)}
              </span>
            )}
          </div>

          {/* META ROW: SAVINGS + COUPON CODE */}
          {(savings && savings > 0) || deal.coupon_code ? (
            <div className="flex items-center justify-between gap-2">
              {savings && savings > 0 ? (
                <span className="badge-good">
                  Save {formatPrice(savings, deal.country)}
                </span>
              ) : <span />}
              {deal.coupon_code && (
                <span className="text-[10px] font-mono text-ink bg-paper-2 border border-rule px-1.5 py-0.5 rounded">
                  {deal.coupon_code}
                </span>
              )}
            </div>
          ) : null}

          {timeLeft && (
            <div className="text-[11px] text-accent timer-pulse">Ends in {timeLeft}</div>
          )}

          {/* VOTE STRIP */}
          {(upvotes > 0 || downvotes > 0 || tier) && (
            <div className="flex items-center justify-between gap-2 text-[11px] pt-2 border-t border-rule">
              <div className="flex items-center gap-1.5">
                <button onClick={e => handleVote(1, e)}
                  className={`text-[11px] transition-colors ${userVote === 1 ? 'text-good font-medium' : 'text-ink-muted hover:text-ink'}`}
                  aria-label="Upvote">▲</button>
                <span className={`font-mono tabular-nums ${
                  netVotes > 0 ? 'text-good' : netVotes < 0 ? 'text-accent' : 'text-ink-muted'
                }`}>{netVotes > 0 ? `+${netVotes}` : netVotes}</span>
                <button onClick={e => handleVote(-1, e)}
                  className={`text-[11px] transition-colors ${userVote === -1 ? 'text-accent font-medium' : 'text-ink-muted hover:text-ink'}`}
                  aria-label="Downvote">▼</button>
              </div>

              {tier && (
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <span className="font-mono tabular-nums">{score}</span>
                  <span className="tracking-wider">HOTNESS</span>
                </div>
              )}
            </div>
          )}

          {authError && (
            <div className="text-accent text-[10px] text-center">
              Sign in to save / vote →
            </div>
          )}

          {/* GET DEAL — full-width black button */}
          <button onClick={handleGetDeal} disabled={clicking}
            className="w-full bg-ink hover:bg-accent text-white
                       text-xs font-medium py-2.5 rounded
                       transition-colors duration-150">
            {clicking ? 'Opening…' : 'Get this deal →'}
          </button>
        </div>
      </div>
    </div>
  )
}
