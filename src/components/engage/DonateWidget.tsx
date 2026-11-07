'use client'
import { useState } from 'react'

const PURPOSES: Array<[string, string, string]> = [
  ['operations', 'Operations', 'Hosting, data feeds and the tools that keep the deal desk running 24/7.'],
  ['marketing', 'Promotion & marketing', 'Getting Daily.Deals in front of more shoppers — more readers, better deals.'],
  ['talent', 'Hiring talent', 'Paying editors, deal hunters, video creators and developers.'],
  ['prizes', 'Contests & prizes', 'Bigger monthly giveaways and community challenges.'],
]
const AMOUNTS = [5, 10, 25, 50, 100, 250]

export default function DonateWidget({ initialPurpose = 'operations' }: { initialPurpose?: string }) {
  const [purpose, setPurpose] = useState(initialPurpose)
  const [amount, setAmount] = useState(25)
  const [custom, setCustom] = useState('')
  const [freq, setFreq] = useState<'once' | 'monthly'>('once')
  const [currency, setCurrency] = useState<'USD' | 'CAD'>('USD')
  const value = custom ? Math.max(1, Math.round(Number(custom) || 0)) : amount
  const href = `/api/donate?amount=${value}&purpose=${purpose}&freq=${freq}&currency=${currency}`
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-ink-2 mb-2">1. Choose where it goes</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {PURPOSES.map(([k, t, s]) => (
            <button key={k} type="button" onClick={() => setPurpose(k)}
              className={`text-left p-4 border transition-colors ${purpose === k ? 'border-ink bg-paper-2' : 'border-rule hover:border-ink'}`}>
              <div className="font-medium text-ink text-sm">{t}{purpose === k && <span className="text-accent"> ✓</span>}</div>
              <div className="text-xs text-ink-2 mt-0.5">{s}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-ink-2 mb-2">2. Choose an amount</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {AMOUNTS.map(a => (
            <button key={a} type="button" onClick={() => { setAmount(a); setCustom('') }}
              className={`px-4 py-2.5 text-sm font-mono border ${!custom && amount === a ? 'bg-ink text-white border-ink' : 'border-rule hover:border-ink'}`}>${a}</button>
          ))}
          <input type="number" min={1} placeholder="Other" value={custom} onChange={e => setCustom(e.target.value)} className="input-paper !w-28 font-mono" aria-label="Custom amount" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="radio" checked={freq === 'once'} onChange={() => setFreq('once')} className="accent-[#DC2626]" /> One-time</label>
          <label className="flex items-center gap-2"><input type="radio" checked={freq === 'monthly'} onChange={() => setFreq('monthly')} className="accent-[#DC2626]" /> Monthly</label>
          <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="input-paper !w-auto !py-1.5" aria-label="Currency"><option>USD</option><option>CAD</option></select>
        </div>
      </div>
      <a href={href} rel="nofollow" className="btn-accent w-full justify-center !py-4 !text-base">
        Give {currency === 'CAD' ? 'C$' : '$'}{value}{freq === 'monthly' ? '/month' : ''} securely →
      </a>
      <p className="text-[11px] text-ink-muted">Payments are processed securely by our payment provider; we never see your card details. Contributions support a for-profit independent publication and are not tax-deductible. Supporting us does not affect giveaway odds.</p>
    </div>
  )
}
