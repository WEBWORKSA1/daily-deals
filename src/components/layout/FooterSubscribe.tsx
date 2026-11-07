'use client'
import { useState } from 'react'

export default function FooterSubscribe() {
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('US')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('busy'); setMsg('')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, country, frequency: 'daily', categories: [] }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Could not subscribe')
      setState('done')
    } catch (err: any) {
      // Fall back to the lead inbox so the signup is never lost.
      try {
        const r2 = await fetch('/api/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form_type: 'alert', path: '/footer', fields: { email, country, product: 'Daily newsletter signup', _t: 0 } }) })
        if (r2.ok) { setState('done'); return }
      } catch {}
      setMsg(err?.message || 'Something went wrong'); setState('err')
    }
  }

  if (state === 'done') return (
    <div className="border border-white/20 p-6">
      <div className="text-[11px] tracking-[0.2em] text-white/60 mb-1">YOU&apos;RE IN</div>
      <p className="font-serif text-2xl text-white">Look for tomorrow morning&apos;s Daily Edition.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="footer-email">Email address</label>
        <input id="footer-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
          className="flex-1 bg-white/5 border border-white/20 text-white placeholder-white/40 rounded px-4 py-3 text-sm focus:outline-none focus:border-white" />
        <select aria-label="Country" value={country} onChange={e => setCountry(e.target.value)}
          className="bg-white/5 border border-white/20 text-white rounded px-3 py-3 text-sm focus:outline-none">
          <option value="US" className="text-ink">US</option>
          <option value="CA" className="text-ink">Canada</option>
        </select>
        <button type="submit" disabled={state === 'busy'} className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded text-sm disabled:opacity-60">
          {state === 'busy' ? 'Subscribing…' : 'Subscribe free'}
        </button>
      </div>
      {msg && <p className="text-xs text-white/80 mt-2">{msg}</p>}
      <p className="text-[11px] text-white/50 mt-3">By subscribing you agree to receive deal emails from Daily.Deals. We never sell your address.</p>
    </form>
  )
}
