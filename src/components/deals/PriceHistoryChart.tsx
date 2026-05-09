'use client'

import { useEffect, useState } from 'react'

type PricePoint = {
  price: number
  recorded_at: string
}

export default function PriceHistoryChart({ dealId }: { dealId: number }) {
  const [history, setHistory] = useState<PricePoint[]>([])
  const [stats, setStats] = useState<any>(null)
  const [current, setCurrent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/deals/${dealId}/price-history`)
      .then(r => r.json())
      .then(d => {
        setHistory(d.history || [])
        setStats(d.stats)
        setCurrent(d.current)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dealId])

  if (loading) {
    return <div className="bg-brand-dark-3 rounded-lg p-6 animate-pulse h-48" />
  }

  // If only one point, show "no history yet" state
  if (history.length < 2) {
    return (
      <div className="bg-brand-dark-3 border border-brand-dark-4 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-lg font-900 text-white uppercase tracking-tight">
            📊 Price History
          </h3>
          <span className="text-xs text-brand-gray">Tracking started today</span>
        </div>
        <p className="text-brand-gray text-sm">
          We'll start tracking price changes for this deal. Check back tomorrow to see if the price drops.
        </p>
      </div>
    )
  }

  // Build chart
  const prices = history.map(h => parseFloat(String(h.price)))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const W = 600, H = 160, P = 20

  const points = history.map((h, i) => {
    const x = P + (i / (history.length - 1)) * (W - 2 * P)
    const y = P + ((max - parseFloat(String(h.price))) / range) * (H - 2 * P)
    return { x, y, price: parseFloat(String(h.price)), date: h.recorded_at }
  })

  const path = points.reduce((acc, p, i) =>
    acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ''
  )

  const trendColor =
    stats?.trend === 'falling' ? '#10b981' :
    stats?.trend === 'rising' ? '#ef4444' :
    '#facc15'

  const trendLabel =
    stats?.trend === 'falling' ? '↓ Falling' :
    stats?.trend === 'rising' ? '↑ Rising' :
    '→ Stable'

  const trendBg =
    stats?.trend === 'falling' ? 'bg-brand-green/20 text-brand-green border-brand-green/40' :
    stats?.trend === 'rising' ? 'bg-brand-red/20 text-brand-red border-brand-red/40' :
    'bg-brand-gold/20 text-brand-gold border-brand-gold/40'

  return (
    <div className="bg-brand-dark-3 border border-brand-dark-4 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-900 text-white uppercase tracking-tight">
          📊 Price History
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${trendBg}`}>
          {trendLabel}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid lines */}
        <line x1={P} y1={P} x2={W - P} y2={P} stroke="rgba(255,255,255,0.05)" />
        <line x1={P} y1={H / 2} x2={W - P} y2={H / 2} stroke="rgba(255,255,255,0.05)" />
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="rgba(255,255,255,0.05)" />

        {/* Area under curve */}
        <path
          d={`${path} L ${points[points.length - 1].x} ${H - P} L ${points[0].x} ${H - P} Z`}
          fill={trendColor} fillOpacity="0.1"
        />

        {/* Line */}
        <path d={path} stroke={trendColor} strokeWidth="2" fill="none" />

        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={trendColor}>
            <title>${p.price.toFixed(2)} on {new Date(p.date).toLocaleDateString()}</title>
          </circle>
        ))}

        {/* Min label */}
        <text x={P} y={P - 4} fill="#10b981" fontSize="10" fontWeight="bold">
          Low: ${min.toFixed(2)}
        </text>
        <text x={W - P} y={P - 4} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="end">
          High: ${max.toFixed(2)}
        </text>
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-brand-dark-4">
        <div>
          <div className="text-[10px] text-brand-gray uppercase tracking-wider">Lowest Ever</div>
          <div className="text-brand-green font-mono text-sm font-bold">
            ${stats?.lowest_ever ? parseFloat(stats.lowest_ever).toFixed(2) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-brand-gray uppercase tracking-wider">30-Day Avg</div>
          <div className="text-white font-mono text-sm font-bold">
            ${stats?.avg_30d ? parseFloat(stats.avg_30d).toFixed(2) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-brand-gray uppercase tracking-wider">Current</div>
          <div className="text-brand-red font-mono text-sm font-bold">
            ${current?.price ? parseFloat(current.price).toFixed(2) : '—'}
          </div>
        </div>
      </div>

      {current?.price && stats?.lowest_ever && parseFloat(current.price) <= parseFloat(stats.lowest_ever) * 1.02 && (
        <div className="mt-3 bg-brand-green/10 border border-brand-green/30 rounded-md px-3 py-2 text-center">
          <span className="text-brand-green text-xs font-bold">
            🔥 At or near the lowest price ever recorded
          </span>
        </div>
      )}
    </div>
  )
}
