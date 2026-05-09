'use client'

import { useEffect, useState } from 'react'

export default function CouponFeedback({ dealId, hasCoupon }: { dealId: number; hasCoupon: boolean }) {
  const [stats, setStats] = useState<{ works: number; fails: number; total: number; rate: number }>({
    works: 0, fails: 0, total: 0, rate: 0
  })
  const [voted, setVoted] = useState<'worked' | 'failed' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/deals/${dealId}/coupon-feedback`)
      .then(r => r.json())
      .then(d => {
        if (d.works !== undefined) setStats(d)
      })
      .catch(() => {})
  }, [dealId])

  async function vote(worked: boolean) {
    if (submitting || voted) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/deals/${dealId}/coupon-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worked }),
      })
      const data = await res.json()
      if (res.ok) {
        setVoted(worked ? 'worked' : 'failed')
        if (data.stats) setStats(data.stats)
      } else if (data.error === 'already_voted') {
        setError('You already voted on this coupon today.')
        setVoted(worked ? 'worked' : 'failed')
      } else {
        setError(data.message || data.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to submit')
    }
    setSubmitting(false)
  }

  if (!hasCoupon) return null

  return (
    <div className="bg-brand-dark-3 border border-brand-dark-4 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-900 text-white uppercase tracking-tight">
          🎟️ Coupon Code Feedback
        </h3>
        {stats.total > 0 && (
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
            stats.rate >= 75 ? 'bg-brand-green/20 text-brand-green border border-brand-green/40' :
            stats.rate >= 40 ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40' :
            'bg-brand-red/20 text-brand-red border border-brand-red/40'
          }`}>
            {stats.rate}% Success
          </span>
        )}
      </div>

      <p className="text-brand-gray text-sm mb-4">
        Did this coupon work for you at checkout? Help others by sharing your experience.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => vote(true)}
          disabled={submitting || voted !== null}
          className={`py-3 rounded-lg border-2 font-bold uppercase text-xs tracking-wider transition-all ${
            voted === 'worked'
              ? 'bg-brand-green text-white border-brand-green'
              : voted
              ? 'bg-brand-dark-4 text-brand-gray border-brand-dark-4 cursor-not-allowed'
              : 'bg-transparent text-brand-green border-brand-green/40 hover:bg-brand-green/10 hover:border-brand-green'
          }`}
        >
          ✓ Worked ({stats.works})
        </button>
        <button
          onClick={() => vote(false)}
          disabled={submitting || voted !== null}
          className={`py-3 rounded-lg border-2 font-bold uppercase text-xs tracking-wider transition-all ${
            voted === 'failed'
              ? 'bg-brand-red text-white border-brand-red'
              : voted
              ? 'bg-brand-dark-4 text-brand-gray border-brand-dark-4 cursor-not-allowed'
              : 'bg-transparent text-brand-red border-brand-red/40 hover:bg-brand-red/10 hover:border-brand-red'
          }`}
        >
          ✗ Didn't Work ({stats.fails})
        </button>
      </div>

      {error && (
        <div className="mt-3 text-center text-xs text-brand-red">{error}</div>
      )}

      {stats.total > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-dark-4">
          <div className="flex justify-between text-xs text-brand-gray mb-2">
            <span>Based on {stats.total} {stats.total === 1 ? 'vote' : 'votes'}</span>
            <span>{stats.rate}% say it works</span>
          </div>
          <div className="h-2 bg-brand-dark-4 rounded-full overflow-hidden flex">
            <div className="bg-brand-green" style={{ width: `${stats.rate}%` }} />
            <div className="bg-brand-red" style={{ width: `${100 - stats.rate}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
