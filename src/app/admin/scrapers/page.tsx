// /admin/scrapers — mission control for the content engine.
//
// AUTH MODEL: This page is protected by CRON_SECRET, NOT by user admin status.
// The endpoints (/api/scrape/run, /api/curator/run, /api/admin/clear-seed-deals)
// each verify the secret independently. Anyone visiting this page can see the
// dashboard chrome, but cannot fire anything without the secret.
//
// Why no admin gate? Because the admin gate creates a chicken-and-egg problem when
// the site is fresh: you need to sign in to grant yourself admin in Supabase, then
// re-sign-in to refresh the cookie, then come here. The CRON_SECRET is the actual
// security boundary — it lives only in Netlify env vars, not in any cookie or session.

'use client'
import { useState, useEffect } from 'react'

interface Stats {
  pending: number
  published: number
  rejected: number
  errors: number
  by_retailer: Array<{ retailer_slug: string; count: number; status: string }>
  recent: Array<{
    id: number; title: string; retailer_slug: string; status: string;
    curator_score: number | null; curator_reasoning: string | null;
    deal_price: number; original_price: number | null; scraped_at: string;
  }>
}

export default function ScrapersAdminPage() {
  const [busy, setBusy] = useState<string | null>(null)
  const [output, setOutput] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [secret, setSecret] = useState<string>('')

  useEffect(() => {
    refreshStats()
    // Try restoring secret from sessionStorage (browser-only, never sent to server)
    try {
      const saved = sessionStorage.getItem('dd_cron_secret')
      if (saved) setSecret(saved)
    } catch {}
  }, [])

  function persistSecret(s: string) {
    setSecret(s)
    try { sessionStorage.setItem('dd_cron_secret', s) } catch {}
  }

  async function refreshStats() {
    try {
      const url = secret
        ? `/api/admin/scraper-stats?secret=${encodeURIComponent(secret)}`
        : '/api/admin/scraper-stats'
      const res = await fetch(url, { headers: { 'x-cron-secret': secret } })
      const json = await res.json()
      if (json.ok) setStats(json)
    } catch {}
  }

  async function run(label: string, path: string) {
    setBusy(label)
    setOutput(null)
    try {
      const url = secret ? `${path}${path.includes('?') ? '&' : '?'}secret=${encodeURIComponent(secret)}` : path
      const res = await fetch(url, { method: 'POST', headers: { 'x-cron-secret': secret } })
      const json = await res.json()
      setOutput({ label, status: res.status, ...json })
    } catch (e: any) {
      setOutput({ label, error: e.message })
    }
    setBusy(null)
    refreshStats()
  }

  async function runFullPipeline() {
    setBusy('full')
    setOutput({ label: 'full', status: 'running', steps: [] })
    const steps: any[] = []

    async function step(name: string, path: string) {
      const url = secret ? `${path}${path.includes('?') ? '&' : '?'}secret=${encodeURIComponent(secret)}` : path
      const res = await fetch(url, { method: 'POST', headers: { 'x-cron-secret': secret } })
      const json = await res.json()
      steps.push({ name, status: res.status, ...json })
      setOutput({ label: 'full', status: 'running', steps: [...steps] })
      return json
    }

    try {
      await step('1/3 clear-seed-deals', '/api/admin/clear-seed-deals')
      await step('2/3 scrape', '/api/scrape/run')
      await step('3/3 curate', '/api/curator/run?limit=200')
    } catch (e: any) {
      steps.push({ error: e.message })
      setOutput({ label: 'full', status: 'error', steps })
    }
    setOutput({ label: 'full', status: 'done', steps })
    setBusy(null)
    refreshStats()
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8">
      <div className="section-eyebrow mb-2">CONTENT ENGINE</div>
      <h1 className="font-serif text-4xl text-ink mb-2">Scrapers</h1>
      <p className="text-ink-2 mb-8">Fire scrapers, run the curator, watch the queue. The scheduled function fires automatically every 6 hours (00:00, 06:00, 12:00, 18:00 UTC).</p>

      <div className="bg-paper-2 border border-rule p-4 mb-6">
        <div className="text-[11px] tracking-[0.15em] text-ink-muted mb-2">CRON_SECRET</div>
        <input value={secret} onChange={e => persistSecret(e.target.value)}
               type="password" placeholder="paste from Netlify env vars"
               className="input-paper" />
        <p className="text-[11px] text-ink-muted mt-2">Required to call protected endpoints. Stays in your browser only (sessionStorage). Clears when you close the tab.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-rule p-4">
            <div className="text-[11px] tracking-[0.15em] text-ink-muted">PENDING</div>
            <div className="font-mono text-3xl text-ink mt-1">{stats.pending}</div>
          </div>
          <div className="border border-rule p-4">
            <div className="text-[11px] tracking-[0.15em] text-ink-muted">PUBLISHED</div>
            <div className="font-mono text-3xl text-good mt-1">{stats.published}</div>
          </div>
          <div className="border border-rule p-4">
            <div className="text-[11px] tracking-[0.15em] text-ink-muted">REJECTED</div>
            <div className="font-mono text-3xl text-ink-muted mt-1">{stats.rejected}</div>
          </div>
          <div className="border border-rule p-4">
            <div className="text-[11px] tracking-[0.15em] text-ink-muted">ERRORS</div>
            <div className="font-mono text-3xl text-accent mt-1">{stats.errors}</div>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-8">
        <button onClick={runFullPipeline} disabled={!!busy || !secret}
                className="btn-accent w-full justify-center text-base py-4 disabled:opacity-40">
          {busy === 'full' ? 'Running full pipeline…' : 'Run full pipeline (clear → scrape → curate)'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => run('migrate', '/api/admin/migrate')} disabled={!!busy} className="btn-outline justify-center">
            {busy === 'migrate' ? '…' : '1. Run migrations'}
          </button>
          <button onClick={() => run('clear', '/api/admin/clear-seed-deals')} disabled={!!busy || !secret} className="btn-outline justify-center disabled:opacity-40">
            {busy === 'clear' ? '…' : '2. Clear seed deals'}
          </button>
          <button onClick={() => run('scrape', '/api/scrape/run')} disabled={!!busy || !secret} className="btn-outline justify-center disabled:opacity-40">
            {busy === 'scrape' ? '…' : '3. Run all scrapers'}
          </button>
          <button onClick={() => run('curate', '/api/curator/run?limit=200')} disabled={!!busy || !secret} className="btn-outline justify-center disabled:opacity-40">
            {busy === 'curate' ? '…' : '4. Run curator (Claude Haiku)'}
          </button>
        </div>
        {!secret && (
          <p className="text-[11px] text-ink-muted text-center">Paste CRON_SECRET above to enable protected actions.</p>
        )}
      </div>

      {output && (
        <div className="bg-ink text-white p-4 mb-6 overflow-x-auto">
          <div className="text-[11px] tracking-[0.15em] text-white/60 mb-2">{output.label?.toUpperCase()} · {output.status}</div>
          <pre className="text-xs leading-relaxed">{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}

      {stats && stats.recent && stats.recent.length > 0 && (
        <div>
          <div className="section-eyebrow mb-2">SECTION 02</div>
          <h2 className="font-serif text-2xl mb-4">Recent queue</h2>
          <div className="space-y-2">
            {stats.recent.map(r => (
              <div key={r.id} className="border border-rule p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] tracking-widest px-1.5 py-0.5 ${
                      r.status === 'published' ? 'bg-good text-white' :
                      r.status === 'rejected'  ? 'bg-rule text-ink-2' :
                      r.status === 'error'     ? 'bg-accent text-white' :
                                                  'bg-paper-2 text-ink-muted border border-rule'
                    }`}>{r.status.toUpperCase()}</span>
                    <span className="text-[11px] text-ink-muted tracking-wide">{r.retailer_slug.toUpperCase()}</span>
                    {r.curator_score !== null && (
                      <span className="font-mono text-xs text-ink-muted">{r.curator_score}/100</span>
                    )}
                  </div>
                  <div className="text-sm text-ink leading-snug">{r.title}</div>
                  {r.curator_reasoning && (
                    <div className="text-[12px] text-ink-2 mt-1 italic">{r.curator_reasoning}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-accent text-base">${r.deal_price}</div>
                  {r.original_price && (
                    <div className="font-mono text-xs text-ink-muted line-through">${r.original_price}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && stats.by_retailer && stats.by_retailer.length > 0 && (
        <div className="mt-8">
          <div className="section-eyebrow mb-2">SECTION 03</div>
          <h2 className="font-serif text-2xl mb-4">Per-retailer counts (last 7d)</h2>
          <div className="grid grid-cols-2 gap-2">
            {stats.by_retailer.map((r, i) => (
              <div key={i} className="border border-rule p-2 flex items-center justify-between">
                <span className="text-xs tracking-wider">{r.retailer_slug.toUpperCase()}</span>
                <span className="font-mono text-sm">{r.count} {r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-rule">
        <div className="section-eyebrow mb-2">ENVIRONMENT CHECKLIST</div>
        <ul className="text-sm space-y-1 text-ink-2">
          <li>• <code>ANTHROPIC_API_KEY</code> — required for the curator (Claude Haiku 4.5)</li>
          <li>• <code>CRON_SECRET</code> — protects /api/scrape/run + /api/curator/run from abuse</li>
          <li>• <code>NEXT_PUBLIC_SKIMLINKS_ID</code> — your Skimlinks publisher id (302790X1790814)</li>
          <li>• <code>NEXT_PUBLIC_AMAZON_US_TAG</code> — your Amazon Associates US tag (dailydeal0dbc-20)</li>
          <li>• <code>NEXT_PUBLIC_AMAZON_CA_TAG</code> — Amazon Associates Canada tag (apply at associates.amazon.ca)</li>
          <li>• <code>SUPABASE_PAT</code> — needed for /api/admin/migrate</li>
        </ul>
      </div>
    </div>
  )
}
