'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export type FieldDef = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  required?: boolean
  options?: Array<string | [string, string]>
  placeholder?: string
  half?: boolean
  help?: string
  defaultValue?: string
  rows?: number
  showIf?: (v: Record<string, string>) => boolean
}

interface Props {
  formType: string
  fields: FieldDef[]
  submitLabel?: string
  successTitle?: string
  successBody?: string
  compact?: boolean
  footnote?: React.ReactNode
  initial?: Record<string, string>
  onSuccess?: (values: Record<string, string>) => void
}

const opt = (o: string | [string, string]) => (Array.isArray(o) ? o : [o, o])

/** One form engine for every lead, inquiry, entry and application on the site. Posts to /api/forms. */
export default function SmartForm({ formType, fields, submitLabel = 'Send', successTitle = 'Received — thank you.', successBody = 'We’ll be in touch shortly.', compact, footnote, initial, onSuccess }: Props) {
  const path = usePathname()
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {}
    fields.forEach(f => { v[f.name] = initial?.[f.name] ?? f.defaultValue ?? '' })
    return v
  })
  const [t0, setT0] = useState(0)
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    setT0(Date.now())
    // Prefill from query string (?product=…&ref=…) so CTAs elsewhere can hand off context.
    try {
      const qs = new URLSearchParams(window.location.search)
      setValues(v => {
        const n = { ...v }
        fields.forEach(f => { const q = qs.get(f.name); if (q && !n[f.name]) n[f.name] = q.slice(0, 300) })
        if (qs.get('ref') && 'ref' in n === false) (n as any).ref = qs.get('ref')!.slice(0, 60)
        return n
      })
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name: string, value: string) => setValues(v => ({ ...v, [name]: value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending'); setError('')
    try {
      const res = await fetch('/api/forms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_type: formType, path, fields: { ...values, _t: t0, company_website: hp } }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.ok) { setError(j.error || 'Something went wrong. Please try again.'); setStatus('error'); return }
      setStatus('done')
      onSuccess?.(values)
    } catch {
      setError('Network error — please try again.'); setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="border border-ink p-6 sm:p-8 bg-white" role="status">
        <div className="section-eyebrow mb-2 text-good">CONFIRMED</div>
        <h3 className="font-serif text-2xl text-ink mb-2">{successTitle}</h3>
        <p className="text-ink-2 text-sm leading-relaxed">{successBody}</p>
      </div>
    )
  }

  const visible = fields.filter(f => !f.showIf || f.showIf(values))
  return (
    <form onSubmit={submit} className={compact ? 'space-y-3' : 'space-y-4'} noValidate={false}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        {visible.map(f => {
          const id = `${formType}-${f.name}`
          const span = f.half ? '' : 'sm:col-span-2'
          const label = (
            <label htmlFor={id} className="block text-[11px] font-medium tracking-[0.12em] uppercase text-ink-2 mb-1.5">
              {f.label}{f.required && <span className="text-accent"> *</span>}
            </label>
          )
          if (f.type === 'checkbox') return (
            <label key={f.name} className={`${span} flex items-start gap-2.5 text-xs text-ink-2 leading-relaxed cursor-pointer`}>
              <input id={id} type="checkbox" required={f.required} checked={values[f.name] === 'yes'}
                onChange={e => set(f.name, e.target.checked ? 'yes' : '')} className="mt-0.5 accent-[#DC2626] w-4 h-4 flex-shrink-0" />
              <span>{f.label}</span>
            </label>
          )
          if (f.type === 'radio') return (
            <fieldset key={f.name} className={span}>
              <legend className="block text-[11px] font-medium tracking-[0.12em] uppercase text-ink-2 mb-1.5">{f.label}</legend>
              <div className="flex flex-wrap gap-2">
                {(f.options || []).map(o => { const [val, lab] = opt(o); const on = values[f.name] === val; return (
                  <button type="button" key={val} onClick={() => set(f.name, val)}
                    className={`px-3 py-2 text-xs border rounded transition-colors ${on ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-rule hover:border-ink'}`}>{lab}</button>
                )})}
              </div>
            </fieldset>
          )
          return (
            <div key={f.name} className={span}>
              {label}
              {f.type === 'textarea' ? (
                <textarea id={id} rows={f.rows || 4} required={f.required} placeholder={f.placeholder} value={values[f.name]}
                  onChange={e => set(f.name, e.target.value)} className="input-paper resize-y" />
              ) : f.type === 'select' ? (
                <select id={id} required={f.required} value={values[f.name]} onChange={e => set(f.name, e.target.value)} className="input-paper">
                  <option value="">Select…</option>
                  {(f.options || []).map(o => { const [val, lab] = opt(o); return <option key={val} value={val}>{lab}</option> })}
                </select>
              ) : (
                <input id={id} type={f.type || 'text'} required={f.required} placeholder={f.placeholder} value={values[f.name]}
                  onChange={e => set(f.name, e.target.value)} className="input-paper"
                  autoComplete={f.type === 'email' ? 'email' : f.name === 'name' ? 'name' : f.type === 'tel' ? 'tel' : undefined} />
              )}
              {f.help && <p className="text-[11px] text-ink-muted mt-1">{f.help}</p>}
            </div>
          )
        })}
      </div>
      {/* honeypot — invisible to humans */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>Company website<input tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} /></label>
      </div>
      {error && <p className="text-accent text-sm" role="alert">{error}</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-accent w-full sm:w-auto justify-center !px-8 !py-3 disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : submitLabel}
      </button>
      {footnote && <div className="text-[11px] text-ink-muted leading-relaxed">{footnote}</div>}
    </form>
  )
}
