// SERVER-ONLY. Never import from a client component.
//
// Every form on Daily.Deals posts to /api/forms, which calls handleSubmission() here.
// The destination inbox is resolved only on the server, so it never appears in any
// HTML, JS bundle, or network response the visitor can see.
//
// Delivery chain (first configured provider wins, all failures fall through):
//   1. Resend         (RESEND_API_KEY [+ RESEND_FROM])
//   2. Web3Forms      (WEB3FORMS_ACCESS_KEY)
//   3. FormSubmit     (no key — one-time activation email on first use;
//                      set FORMSUBMIT_ALIAS to the hashed alias it gives you)
// Storage (always attempted, independent of email):
//   a. Supabase `leads` table (insert-only grant for anon)
//   b. Netlify Blobs store "leads" (fallback when the table is unavailable)

import { createHash } from 'crypto'
import { supabase } from '@/lib/db'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// Base64 so the address isn't trivially harvested from the public repo either.
const DEFAULT_INBOX_B64 = 'd2Vid29ya3NhMUBnbWFpbC5jb20='

function inbox(): string {
  if (process.env.CONTACT_EMAIL) return process.env.CONTACT_EMAIL
  return Buffer.from(DEFAULT_INBOX_B64, 'base64').toString('utf8')
}

/** Used by /api/donate to build a PayPal link server-side. Never send this to the client. */
export function donationReceiver(): string {
  return process.env.PAYPAL_RECEIVER || inbox()
}

export const FORM_TYPES = {
  contact: 'General contact',
  domain: 'Website / domain acquisition inquiry',
  sponsorship: 'Sponsorship inquiry',
  advertise: 'Advertising inquiry',
  partnership: 'Partnership inquiry',
  concierge: 'Deal Concierge request',
  alert: 'Price alert request',
  contest: 'Giveaway entry',
  careers: 'Job application',
  pledge: 'Support / donation pledge',
  'local-business': 'Local business deal listing',
  'submit-deal': 'Community deal submission',
  feedback: 'Site feedback',
  dmca: 'Copyright / DMCA notice',
} as const
export type FormType = keyof typeof FORM_TYPES

export interface Submission {
  form_type: FormType
  fields: Record<string, string>
  source_path?: string
  referrer?: string
  ip?: string
  user_agent?: string
}

const MAX_FIELD = 5000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function sanitize(fields: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(fields || {})) {
    if (!/^[a-z0-9_]{1,40}$/i.test(k)) continue
    if (k.startsWith('_') || k === 'company_website') continue
    const val = Array.isArray(v) ? v.join(', ') : String(v ?? '')
    out[k] = val.replace(/\u0000/g, '').slice(0, MAX_FIELD).trim()
  }
  return out
}

export function validate(type: string, f: Record<string, string>): string | null {
  if (!(type in FORM_TYPES)) return 'Unknown form.'
  if (!f.email || !EMAIL_RE.test(f.email)) return 'Please enter a valid email address.'
  if (['contact', 'domain', 'sponsorship', 'advertise', 'partnership', 'dmca', 'feedback'].includes(type) && (f.message || '').length < 10)
    return 'Please add a short message (10+ characters).'
  if (type === 'contest') {
    if (f.rules_accepted !== 'yes') return 'Please accept the official rules to enter.'
    if (f.age_ok !== 'yes') return 'You must be 18 or older (or the age of majority where you live) to enter.'
    if (f.country === 'CA' && /^(qc|quebec|québec)$/i.test((f.region || '').trim())) return 'Sorry — residents of Quebec are not eligible for this draw.'
    if (f.country === 'CA' && (f.skill_answer || '').replace(/\s/g, '') !== '25') return 'Canadian entrants must correctly answer the skill-testing question.'
  }
  if (type === 'concierge' && (f.product || '').length < 2) return 'Tell us what you are shopping for.'
  return null
}

function hashIp(ip?: string): string | null {
  if (!ip) return null
  return createHash('sha256').update(ip + (process.env.CRON_SECRET || 'dd-salt')).digest('hex').slice(0, 32)
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function subjectFor(s: Submission): string {
  const label = FORM_TYPES[s.form_type]
  const who = s.fields.name || s.fields.company || s.fields.email
  return `[${SITE_NAME}] ${label}${s.fields.subject ? ' — ' + s.fields.subject : ''} — ${who}`.slice(0, 200)
}

function htmlFor(s: Submission): string {
  const rows = Object.entries(s.fields)
    .map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e2db;font:600 12px sans-serif;color:#4a4a4a;text-transform:uppercase">${esc(k.replace(/_/g, ' '))}</td><td style="padding:6px 10px;border:1px solid #e5e2db;font:14px sans-serif;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join('')
  return `<div style="font-family:Georgia,serif"><h2 style="margin:0 0 8px">${esc(FORM_TYPES[s.form_type])}</h2>
<p style="font:13px sans-serif;color:#8a8682;margin:0 0 12px">Submitted on ${esc(SITE_URL)}${esc(s.source_path || '')} · ${new Date().toISOString()}</p>
<table style="border-collapse:collapse;width:100%">${rows}</table></div>`
}

async function viaResend(s: Submission): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || `${SITE_NAME} <onboarding@resend.dev>`,
      to: [inbox()],
      reply_to: s.fields.email,
      subject: subjectFor(s),
      html: htmlFor(s),
    }),
    signal: AbortSignal.timeout(10_000),
  })
  return res.ok
}

async function viaWeb3Forms(s: Submission): Promise<boolean> {
  const key = process.env.WEB3FORMS_ACCESS_KEY
  if (!key) return false
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: key, subject: subjectFor(s), from_name: SITE_NAME, replyto: s.fields.email, form: FORM_TYPES[s.form_type], ...s.fields }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) return false
  const j: any = await res.json().catch(() => ({}))
  return j?.success === true || j?.success === 'true'
}

async function viaFormSubmit(s: Submission): Promise<boolean> {
  const target = process.env.FORMSUBMIT_ALIAS || inbox()
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(target)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: SITE_URL, Referer: `${SITE_URL}${s.source_path || '/contact'}` },
    body: JSON.stringify({ _subject: subjectFor(s), _replyto: s.fields.email, _template: 'table', _captcha: 'false', form: FORM_TYPES[s.form_type], page: s.source_path || '', ...s.fields }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) return false
  const j: any = await res.json().catch(() => ({}))
  // FormSubmit replies success:"false" until the inbox owner clicks the one-time activation email.
  return j?.success === true || j?.success === 'true'
}

async function deliver(s: Submission): Promise<boolean> {
  for (const fn of [viaResend, viaWeb3Forms, viaFormSubmit]) {
    try { if (await fn(s)) return true } catch (e: any) { console.error('[forms] provider failed', fn.name, e?.message) }
  }
  return false
}

async function store(s: Submission, delivered: boolean): Promise<boolean> {
  const row = {
    form_type: s.form_type,
    name: (s.fields.name || s.fields.company || '').slice(0, 200) || null,
    email: s.fields.email?.slice(0, 320) || null,
    phone: (s.fields.phone || '').slice(0, 60) || null,
    country: (s.fields.country || '').slice(0, 8) || null,
    subject: (s.fields.subject || s.fields.product || s.fields.role || '').slice(0, 300) || null,
    payload: s.fields,
    source_path: s.source_path?.slice(0, 300) || null,
    referrer: s.referrer?.slice(0, 500) || null,
    ip_hash: hashIp(s.ip),
    user_agent: s.user_agent?.slice(0, 400) || null,
    delivered,
  }
  try {
    const { error } = await supabase.from('leads').insert(row)
    if (!error) return true
    console.error('[forms] supabase insert failed', error.message)
  } catch (e: any) { console.error('[forms] supabase threw', e?.message) }
  try {
    const { getStore } = await import('@netlify/blobs')
    const blob = getStore('leads')
    await blob.setJSON(`${new Date().toISOString()}-${s.form_type}-${Math.random().toString(36).slice(2, 8)}`, row)
    return true
  } catch (e: any) { console.error('[forms] blobs fallback failed', e?.message) }
  console.log('[forms] UNSTORED LEAD', JSON.stringify(row))
  return false
}

export async function handleSubmission(s: Submission): Promise<{ ok: boolean; delivered: boolean; stored: boolean }> {
  const delivered = await deliver(s)
  const stored = await store(s, delivered)
  return { ok: delivered || stored, delivered, stored }
}
