'use client'
import { useState, useEffect } from 'react'
import { useLocation } from '@/hooks/useLocation'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function LocationModal({ isOpen, onClose }: Props) {
  const { location, error, setManualLocation, clearLocation } = useLocation()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) { setInput(''); setSubmitting(false) }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setSubmitting(true)
    const ok = await setManualLocation(input)
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-brand-dark-2 border border-white/15 rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Location</span>
            <h2 className="font-heading text-3xl font-900 text-white uppercase mt-1">Set Your Location</h2>
            <p className="text-brand-gray text-xs mt-2">
              Enter your ZIP code (US) or postal code (Canada) to see daily deals near you.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-brand-gray hover:text-white text-2xl leading-none ml-2"
          >×</button>
        </div>

        {location && (
          <div className="bg-brand-dark-3 border border-white/10 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div>
              <div className="text-brand-gray text-xs uppercase tracking-wider mb-0.5">Current</div>
              <div className="text-white text-sm font-semibold">
                📍 {location.city}, {location.stateCode} {location.country === 'CA' ? '🇨🇦' : '🇺🇸'}
              </div>
            </div>
            <button
              onClick={() => { clearLocation(); onClose() }}
              className="text-brand-gray hover:text-brand-red text-xs font-bold uppercase tracking-wider"
            >Clear</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">
              Postal Code or ZIP
            </label>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. M5V 1A1 or 10001"
              className="input-dark text-base"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="text-brand-red text-xs font-medium bg-brand-red/10 border border-brand-red/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="btn-primary w-full justify-center py-3.5 disabled:opacity-50"
          >
            {submitting ? 'Finding deals...' : 'Find Daily Deals →'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-white/10">
          <div className="text-brand-gray text-xs uppercase tracking-wider mb-2 font-bold">Try these</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { code: 'L6E', label: 'Markham 🇨🇦' },
              { code: 'M5V', label: 'Toronto 🇨🇦' },
              { code: 'H3A', label: 'Montreal 🇨🇦' },
              { code: 'V6B', label: 'Vancouver 🇨🇦' },
              { code: '10001', label: 'NYC 🇺🇸' },
              { code: '90001', label: 'LA 🇺🇸' },
              { code: '60601', label: 'Chicago 🇺🇸' },
              { code: '94102', label: 'SF 🇺🇸' },
            ].map(s => (
              <button
                key={s.code}
                type="button"
                onClick={() => setInput(s.code)}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10
                           hover:border-white/25 text-brand-gray-2 hover:text-white
                           px-2.5 py-1 rounded-md transition-all"
              >{s.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
