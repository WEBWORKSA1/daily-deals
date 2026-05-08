'use client'
import { useState } from 'react'
import { useLocation } from '@/hooks/useLocation'

export default function NewsletterSignup() {
  const { location } = useLocation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          location_city:    location?.city || null,
          location_country: location?.country || null,
          location_postal:  location?.postalCode || null
        })
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch { setStatus('error') }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand-dark-3 border border-white/8">
      {/* BG GLOW */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(232,34,42,0.12), transparent 70%)' }} />

      <div className="relative p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-red/15
                        border border-brand-red/25 rounded-2xl text-2xl mb-5">
          📧
        </div>

        <h2 className="font-heading text-3xl md:text-4xl font-900 text-white uppercase mb-2">
          Never Miss a Deal
        </h2>
        <p className="text-brand-gray text-sm max-w-md mx-auto mb-8">
          Get the top 10 deals of the day delivered every morning.
          {location ? ` Personalized for ${location.city}.` : ' Personalized for your location.'}
        </p>

        {status === 'done' ? (
          <div className="inline-flex items-center gap-2 bg-brand-green/15 border border-brand-green/30
                          text-brand-green px-6 py-3 rounded-full font-semibold text-sm">
            ✅ You're in! Check your inbox tomorrow morning.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="input-dark flex-1"
            />
            <button type="submit" disabled={status === 'loading'} className="btn-primary px-6 whitespace-nowrap">
              {status === 'loading' ? 'Subscribing...' : 'Get Daily Deals'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-brand-red text-xs mt-3">Something went wrong. Please try again.</p>
        )}

        <p className="text-brand-gray text-xs mt-4">No spam. Unsubscribe anytime. Free forever.</p>

        {/* TRUST BADGES */}
        <div className="flex items-center justify-center gap-6 mt-6 text-brand-gray text-xs">
          <span>✅ 100% Free</span>
          <span>✅ No Spam</span>
          <span>✅ Unsubscribe Anytime</span>
        </div>
      </div>
    </section>
  )
}
