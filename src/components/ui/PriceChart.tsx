'use client'
import { useEffect, useState } from 'react'

interface PricePoint {
  price: number
  recorded_at: string
}

interface Stats {
  deal_price: number
  lowest_price_ever: number | null
  highest_price_ever: number | null
  avg_price_30d: number | null
  price_trend: string | null
}

export default function PriceChart({ dealId }: { dealId: number }) {
  const [history, setHistory] = useState<PricePoint[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/price-history?deal_id=${dealId}`)
        const json = await res.json()
        setHistory(json.history || [])
        setStats(json.stats || null)
      } finally { setLoading(false) }
    })()
  }, [dealId])

  if (loading) {
    return (
      <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6 animate-pulse h-64" />
    )
  }

  // No data yet — show stub
  if (!history || history.length < 2) {
    return (
      <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6 text-center">
        <h3 className="text-white font-bold mb-2">📈 Price History</h3>
        <p className="text-brand-gray text-xs">
          Tracking starts when this deal updates. Check back soon for full price history.
        </p>
      </div>
    )
  }

  // Compute SVG bounds
  const prices = history.map(h => h.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const W = 100, H = 50

  // Build path points
  const pts = history.map((h, i) => {
    const x = (i / (history.length - 1)) * W
    const y = H - ((h.price - min) / range) * H
    return { x, y, price: h.price, date: h.recorded_at }
  })

  const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`

  const trendColors: Record<string, string> = {
    lowest_ever: '#22C55E',
    falling: '#22C55E',
    stable: '#888',
    rising: '#F5A623',
    highest_ever: '#E8222A',
  }
  const trendLabels: Record<string, string> = {
    lowest_ever: '🎯 Lowest ever',
    falling: '📉 Falling',
    stable: '➡️ Stable',
    rising: '📈 Rising',
    highest_ever: '🚨 Highest ever',
  }
  const trendKey = stats?.price_trend || 'stable'
  const trendColor = trendColors[trendKey]
  const trendLabel = trendLabels[trendKey]

  return (
    <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">📈 Price History</h3>
        <span className="text-xs font-bold px-2 py-1 rounded-md"
              style={{ background: trendColor + '22', color: trendColor }}>
          {trendLabel}
        </span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`pg${dealId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#pg${dealId})`} />
          <path d={pathD} fill="none" stroke={trendColor} strokeWidth="0.6" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="0.7" fill={trendColor} />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div>
          <div className="text-brand-gray text-[10px] uppercase tracking-wider">Lowest</div>
          <div className="text-brand-green font-bold text-sm">
            ${Number(stats?.lowest_price_ever || min).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-brand-gray text-[10px] uppercase tracking-wider">30-day avg</div>
          <div className="text-white font-bold text-sm">
            ${Number(stats?.avg_price_30d || prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-brand-gray text-[10px] uppercase tracking-wider">Highest</div>
          <div className="text-brand-red font-bold text-sm">
            ${Number(stats?.highest_price_ever || max).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
