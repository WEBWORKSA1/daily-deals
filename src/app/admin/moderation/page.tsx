'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Flag {
  id: number
  target_type: string
  target_id: number
  reason: string
  details: string | null
  created_at: string
  flagged_by: { username: string } | null
}

export default function ModerationPage() {
  const router = useRouter()
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/flags')
        if (res.status === 403 || res.status === 401) {
          setForbidden(true)
          setLoading(false)
          return
        }
        const json = await res.json()
        setFlags(json.flags || [])
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) {
    return <><Header /><main className="p-12 text-center text-brand-gray">Loading…</main><Footer /></>
  }

  if (forbidden) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto p-12 text-center">
          <h1 className="text-white font-heading text-2xl mb-2">🔒 Moderator Access</h1>
          <p className="text-brand-gray">This page is for moderators and admins only.</p>
        </main>
        <Footer />
      </>
    )
  }

  const reasonColors: Record<string, string> = {
    spam: '#E8222A',
    expired: '#F5A623',
    wrong_price: '#F5A623',
    inappropriate: '#E8222A',
    other: '#888',
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-brand-dark-3 border-b border-white/5 py-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-900 text-white uppercase">🛡️ Moderation Queue</h1>
            <p className="text-brand-gray text-sm mt-1">{flags.length} unresolved flag{flags.length !== 1 ? 's' : ''}</p>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {flags.length === 0 ? (
            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-12 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-white text-lg font-bold mb-2">All clear!</h3>
              <p className="text-brand-gray text-sm">No unresolved flags right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map(f => (
                <div key={f.id} className="bg-brand-dark-3 border border-white/5 rounded-lg p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md"
                            style={{ background: (reasonColors[f.reason] || '#888') + '22',
                                     color: reasonColors[f.reason] || '#888' }}>
                        {f.reason.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-brand-gray">on {f.target_type}</span>
                    </div>
                    <Link href={f.target_type === 'deal' ? `/deal/${f.target_id}` : `#`}
                          className="text-white text-sm font-bold hover:text-brand-red">
                      {f.target_type === 'deal' ? `Deal #${f.target_id}` : `Comment #${f.target_id}`} →
                    </Link>
                    {f.details && (
                      <p className="text-brand-gray-2 text-xs mt-1">{f.details}</p>
                    )}
                    <p className="text-brand-gray text-xs mt-2">
                      By {f.flagged_by?.username || 'anonymous'} · {new Date(f.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
