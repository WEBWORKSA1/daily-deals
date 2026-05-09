'use client'
import { useEffect, useState } from 'react'

export default function CouponFeedback({ dealId, couponCode }: {
  dealId: number
  couponCode: string | null
}) {
  const [stats, setStats] = useState<{
    coupon_works_count: number
    coupon_fails_count: number
    coupon_success_rate: number
  } | null>(null)
  const [submitted, setSubmitted] = useState<'worked'|'failed'|null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/coupon-feedback?deal_id=${dealId}`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [dealId])

  if (!couponCode) return null

  async function submit(worked: boolean) {
    setLoading(true)
    try {
      const res = await fetch('/api/coupon-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId, worked }),
      })
      const json = await res.json()
      if (res.ok) {
        setStats({
          coupon_works_count: json.coupon_works_count || 0,
          coupon_fails_count: json.coupon_fails_count || 0,
          coupon_success_rate: json.coupon_success_rate || 0,
        })
        setSubmitted(worked ? 'worked' : 'failed')
      }
    } finally { setLoading(false) }
  }

  const works = stats?.coupon_works_count || 0
  const fails = stats?.coupon_fails_count || 0
  const total = works + fails
  const rate = stats?.coupon_success_rate || 0

  return (
    <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-3">🎟️ Coupon Code</h3>

      <div className="bg-brand-gold/10 border-2 border-dashed border-brand-gold/40 rounded-lg
                      px-4 py-3 mb-4 text-center">
        <div className="font-mono text-brand-gold text-2xl font-black tracking-wider">
          {couponCode}
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(couponCode)}
          className="text-xs text-brand-gray hover:text-white mt-1">
          Tap to copy
        </button>
      </div>

      {/* SUCCESS RATE BAR */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-brand-gray">Success rate from {total} {total === 1 ? 'user' : 'users'}</span>
            <span className={`font-bold ${
              rate >= 70 ? 'text-brand-green' : rate >= 40 ? 'text-brand-gold' : 'text-brand-red'
            }`}>{rate}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500"
              style={{
                width: `${rate}%`,
                background: rate >= 70 ? '#22C55E' : rate >= 40 ? '#F5A623' : '#E8222A',
              }} />
          </div>
        </div>
      )}

      {/* FEEDBACK BUTTONS */}
      {submitted ? (
        <div className="bg-brand-green/10 border border-brand-green/30 text-brand-green
                        text-xs px-3 py-2 rounded-md text-center">
          ✓ Thanks for your feedback!
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-brand-gray text-xs text-center mb-2">Did this code work for you?</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => submit(true)} disabled={loading}
              className="bg-brand-green/10 hover:bg-brand-green/20 text-brand-green
                         border border-brand-green/30 text-xs font-bold uppercase tracking-wider
                         py-2.5 rounded-lg transition-colors">
              ✓ Worked
            </button>
            <button onClick={() => submit(false)} disabled={loading}
              className="bg-brand-red/10 hover:bg-brand-red/20 text-brand-red
                         border border-brand-red/30 text-xs font-bold uppercase tracking-wider
                         py-2.5 rounded-lg transition-colors">
              ✗ Didn't work
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
