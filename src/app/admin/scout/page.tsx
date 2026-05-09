'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ScoutAdminPage() {
  const [tab, setTab] = useState<'queue' | 'run'>('queue')
  const [pending, setPending] = useState<any[]>([])
  const [feedUrl, setFeedUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [autoApproveAbove, setAutoApproveAbove] = useState(80)
  const [minScore, setMinScore] = useState(50)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<any>(null)
  const [previewItems, setPreviewItems] = useState<any[]>([])

  async function loadQueue() {
    const res = await fetch('/api/scout/queue')
    const data = await res.json()
    if (data.ok) setPending(data.deals)
  }

  useEffect(() => { if (tab === 'queue') loadQueue() }, [tab])

  async function approveDeal(deal_id: number) {
    await fetch('/api/scout/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id, action: 'approve' }),
    })
    setPending(p => p.filter(d => d.id !== deal_id))
  }

  async function rejectDeal(deal_id: number) {
    await fetch('/api/scout/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id, action: 'reject' }),
    })
    setPending(p => p.filter(d => d.id !== deal_id))
  }

  async function previewFeed() {
    if (!feedUrl) return
    const res = await fetch(`/api/scout/run?feed_url=${encodeURIComponent(feedUrl)}`)
    const data = await res.json()
    if (data.ok) setPreviewItems(data.items)
    else alert(data.error)
  }

  async function runScout() {
    if (!feedUrl || !sourceName) return alert('Need feed URL and source name')
    setRunning(true)
    setRunResult(null)
    try {
      const res = await fetch('/api/scout/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_url: feedUrl,
          source_name: sourceName,
          auto_approve_above: autoApproveAbove,
          min_score: minScore,
        }),
      })
      const data = await res.json()
      setRunResult(data)
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="mb-8">
            <h1 className="font-heading text-4xl font-900 text-white uppercase tracking-tight">
              🤖 AI Deal Scout
            </h1>
            <p className="text-brand-gray mt-2">
              Auto-discover deals from RSS feeds. Review the queue and approve.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10">
            {(['queue', 'run'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-bold uppercase tracking-tight ${
                  tab === t ? 'text-brand-red border-b-2 border-brand-red' : 'text-brand-gray hover:text-white'
                }`}
              >
                {t === 'queue' ? `Pending Queue${pending.length ? ` (${pending.length})` : ''}` : 'Run Scout'}
              </button>
            ))}
          </div>

          {/* QUEUE TAB */}
          {tab === 'queue' && (
            <div>
              {pending.length === 0 ? (
                <div className="text-center py-20 text-brand-gray">
                  <div className="text-6xl mb-4">✨</div>
                  <p>No pending deals. Run the scout to discover new deals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pending.map(deal => (
                    <div key={deal.id} className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex gap-4">
                        {deal.image_url && (
                          <img src={deal.image_url} alt={deal.title} className="w-24 h-24 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                            {deal.retailers?.name || 'Unknown retailer'} · {deal.category || 'Other'}
                          </div>
                          <h3 className="font-heading font-bold text-gray-900 line-clamp-2">{deal.title}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            {deal.deal_price && <span className="text-lg font-900 text-brand-red">${deal.deal_price}</span>}
                            {deal.original_price && <span className="text-sm text-gray-500 line-through">${deal.original_price}</span>}
                            {deal.discount_percent && <span className="text-xs font-bold text-green-600">-{deal.discount_percent}%</span>}
                          </div>
                          {deal.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{deal.description}</p>
                          )}
                          <a href={deal.affiliate_url} target="_blank" rel="noopener" className="text-xs text-blue-600 underline mt-1 inline-block">
                            View source →
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => approveDeal(deal.id)}
                          className="flex-1 bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => rejectDeal(deal.id)}
                          className="flex-1 bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RUN TAB */}
          {tab === 'run' && (
            <div className="max-w-3xl">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">RSS Feed URL</label>
                  <input
                    type="url"
                    value={feedUrl}
                    onChange={e => setFeedUrl(e.target.value)}
                    placeholder="https://example.com/deals/feed"
                    className="w-full bg-black/30 border border-white/20 rounded px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Source Name</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={e => setSourceName(e.target.value)}
                    placeholder="e.g., Slickdeals Frontpage"
                    className="w-full bg-black/30 border border-white/20 rounded px-4 py-3 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Min score (queue): {minScore}
                    </label>
                    <input
                      type="range" min={0} max={100} value={minScore}
                      onChange={e => setMinScore(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Auto-approve above: {autoApproveAbove}
                    </label>
                    <input
                      type="range" min={50} max={100} value={autoApproveAbove}
                      onChange={e => setAutoApproveAbove(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={previewFeed}
                    disabled={!feedUrl}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded disabled:opacity-50"
                  >
                    Preview Feed
                  </button>
                  <button
                    onClick={runScout}
                    disabled={!feedUrl || !sourceName || running}
                    className="bg-brand-red hover:bg-red-700 text-white font-bold px-6 py-3 rounded disabled:opacity-50"
                  >
                    {running ? 'Running…' : 'Run Scout & Save'}
                  </button>
                </div>
              </div>

              {/* Preview results */}
              {previewItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-heading text-xl font-bold text-white mb-4">Preview ({previewItems.length} items)</h3>
                  <div className="space-y-2">
                    {previewItems.map((item, i) => (
                      <div key={i} className="bg-white/5 rounded p-3 flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                          item.score >= 80 ? 'bg-green-500/30 text-green-400' :
                          item.score >= 50 ? 'bg-yellow-500/30 text-yellow-400' :
                          'bg-red-500/30 text-red-400'
                        }`}>
                          {item.score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-bold truncate">{item.title}</div>
                          <div className="text-xs text-brand-gray">
                            {item.retailer || 'no retailer'} · {item.category || 'no category'} {item.price ? `· $${item.price}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Run results */}
              {runResult && (
                <div className="mt-8 bg-white/5 rounded p-6">
                  <h3 className="font-heading text-xl font-bold text-white mb-3">Run Results</h3>
                  {runResult.ok ? (
                    <div className="text-white">
                      <p>Found {runResult.items_found} items, processed {runResult.items_processed},
                      saved <span className="text-green-400 font-bold">{runResult.items_saved}</span> to queue.</p>
                      <button onClick={() => setTab('queue')} className="text-brand-red underline text-sm mt-2">
                        → Review pending queue
                      </button>
                    </div>
                  ) : (
                    <p className="text-red-400">{runResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
