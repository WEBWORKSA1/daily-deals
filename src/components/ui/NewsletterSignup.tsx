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
      const res = await fetch('/api/subscribers', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, location_city: location?.city || null, location_country: location?.country || null, location_postal: location?.postalCode || null }) })
      setStatus(res.ok ? 'done' : 'error')
    } catch { setStatus('error') }
  }

  return (
    <section className="bg-brand-navy rounded-2xl p-8 md:p-12 text-center text-white">
      <div className="text-4xl mb-4">📧</div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">Get Today&apos;s Top 10 Deals</h2>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">Daily deals delivered to your inbox every morning.{location ? ` Personalized for ${location.city}.` : ' Personalized for your location.'}</p>
      {status === 'done' ? (
        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-full font-medium">✅ You&apos;re in! Check your inbox for today&apos;s top deals.</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" required
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-brand-orange" />
          <button type="submit" disabled={status === 'loading'} className="btn-primary px-6 py-3 whitespace-nowrap">{status === 'loading' ? 'Joining...' : 'Get Daily Deals'}</button>
        </form>
      )}
      {status === 'error' && <p className="text-red-400 text-sm mt-2">Something went wrong. Please try again.</p>}
      <p className="text-gray-500 text-xs mt-4">No spam. Unsubscribe anytime.</p>
    </section>
  )
}
