'use client'
import { useState } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { CATEGORIES } from '@/lib/utils'

const FREQUENCIES = [
  { value: 'daily',   label: 'Daily Digest',   sub: 'Top 10 deals every morning' },
  { value: 'weekly',  label: 'Weekly Roundup', sub: 'Best deals every Monday' },
  { value: 'instant', label: 'Instant Alerts', sub: 'Hottest deals as they drop' },
]

export default function NewsletterSignup() {
  const { location } = useLocation()
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleCategory(c: string) {
    setSelectedCategories(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          frequency,
          categories: selectedCategories,
          country: location?.country || 'US',
          postal_code: location?.postalCode || null,
          location_city:    location?.city || null,
          location_country: location?.country || null,
          location_postal:  location?.postalCode || null,
        })
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Something went wrong')
        setStatus('error')
      } else {
        setStatus('done')
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Network error')
      setStatus('error')
    }
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand-dark-3 border border-white/8">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(232,34,42,0.12), transparent 70%)' }} />

      <div className="relative p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-red/15
                          border border-brand-red/25 rounded-2xl text-2xl mb-5">
            📧
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-900 text-white uppercase mb-2">
            Never Miss a Deal
          </h2>
          <p className="text-brand-gray text-sm max-w-md mx-auto">
            {location
              ? `Personalized for ${location.city}. `
              : 'Personalized for your location. '}
            Choose your frequency, your categories, your way.
          </p>
        </div>

        {status === 'done' ? (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-brand-green/15 border border-brand-green/30
                            text-brand-green px-6 py-3 rounded-full font-semibold text-sm">
              ✅ You're in! Check your inbox to confirm.
            </div>
            <p className="text-brand-gray text-xs mt-3">
              You can manage alerts and preferences anytime from the email footer.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* EMAIL */}
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="input-dark w-full h-12"
              />
            </div>

            {/* FREQUENCY */}
            <div>
              <label className="text-brand-gray text-xs uppercase tracking-wider block mb-2 font-bold">
                How often?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {FREQUENCIES.map(f => (
                  <button key={f.value} type="button"
                    onClick={() => setFrequency(f.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      frequency === f.value
                        ? 'bg-brand-red/15 border-brand-red text-white'
                        : 'bg-white/5 border-white/10 text-brand-gray-2 hover:bg-white/10'
                    }`}>
                    <div className="font-bold text-xs uppercase tracking-wider">{f.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{f.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ADVANCED — categories */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-brand-gray text-xs hover:text-white">
                {showAdvanced ? '− Hide' : '+ Show'} category preferences (optional)
              </button>
              {showAdvanced && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.slug} type="button"
                      onClick={() => toggleCategory(cat.label)}
                      className={`text-[11px] py-1.5 px-2 rounded-md border transition-colors ${
                        selectedCategories.includes(cat.label)
                          ? 'bg-brand-red/20 border-brand-red text-brand-red font-bold'
                          : 'bg-white/5 border-white/10 text-brand-gray-2 hover:bg-white/10'
                      }`}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={status === 'loading'}
              className="btn-primary w-full h-12 text-sm">
              {status === 'loading' ? 'Subscribing...' : '🔥 Get My Personalized Deals'}
            </button>

            {status === 'error' && (
              <p className="text-brand-red text-xs text-center">{errorMsg || 'Something went wrong.'}</p>
            )}
          </form>
        )}

        <div className="flex items-center justify-center gap-6 mt-8 text-brand-gray text-xs">
          <span>✅ 100% Free</span>
          <span>✅ No Spam</span>
          <span>✅ Unsubscribe Anytime</span>
        </div>
      </div>
    </section>
  )
}
