'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealCard from '@/components/deals/DealCard'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saves, setSaves] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [tab, setTab] = useState<'saves'|'alerts'|'profile'>('saves')

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth')
        const json = await res.json()
        if (!json.user) {
          router.push('/signin')
          return
        }
        setUser(json.user)

        const [savesRes, alertsRes] = await Promise.all([
          fetch('/api/saves'),
          fetch(`/api/alerts?email=${encodeURIComponent(json.user.email)}`),
        ])
        const savesJson = await savesRes.json()
        const alertsJson = await alertsRes.json()
        setSaves(savesJson.saves || [])
        setAlerts(alertsJson.alerts || [])
      } finally { setLoading(false) }
    })()
  }, [router])

  async function signOut() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  async function deleteAlert(id: number) {
    await fetch(`/api/alerts?id=${id}&email=${encodeURIComponent(user.email)}`, { method: 'DELETE' })
    setAlerts(alerts.filter(a => a.id !== id))
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-screen-2xl mx-auto px-4 py-12">
          <div className="text-center text-brand-gray">Loading...</div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-brand-dark-3 border-b border-white/5 py-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-900 text-white uppercase">
                Hi, {user?.username || user?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-brand-gray text-sm mt-1">Manage your saved deals, alerts, and preferences.</p>
            </div>
            <button onClick={signOut} className="text-brand-gray text-xs hover:text-brand-red">
              Sign out
            </button>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* TABS */}
          <div className="border-b border-white/5 mb-6 flex gap-1 overflow-x-auto">
            {[
              { id: 'saves',   label: '💾 Saved Deals',  count: saves.length },
              { id: 'alerts',  label: '🔔 Alerts',       count: alerts.length },
              { id: 'profile', label: '⚙️ Profile',      count: null },
            ].map((t: any) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  tab === t.id
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-brand-gray hover:text-white'
                }`}>
                {t.label} {t.count !== null && <span className="ml-1 text-brand-gray text-xs">({t.count})</span>}
              </button>
            ))}
          </div>

          {/* SAVES */}
          {tab === 'saves' && (
            saves.length === 0 ? (
              <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-12 text-center">
                <div className="text-5xl mb-3">💾</div>
                <h3 className="text-white text-lg font-bold mb-2">No saved deals yet</h3>
                <p className="text-brand-gray text-sm">Click the bookmark icon on any deal to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {saves.map(deal => <DealCard key={deal.id} deal={deal} />)}
              </div>
            )
          )}

          {/* ALERTS */}
          {tab === 'alerts' && (
            alerts.length === 0 ? (
              <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-12 text-center">
                <div className="text-5xl mb-3">🔔</div>
                <h3 className="text-white text-lg font-bold mb-2">No alerts set up</h3>
                <p className="text-brand-gray text-sm">Set up alerts to be notified when matching deals appear.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id}
                    className="bg-brand-dark-3 border border-white/5 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">
                        {alert.keyword && <span>"{alert.keyword}"</span>}
                        {alert.retailer_slug && <span className="ml-2 text-brand-red">at {alert.retailer_slug}</span>}
                        {alert.category && <span className="ml-2 text-brand-gold">in {alert.category}</span>}
                      </div>
                      <div className="text-brand-gray text-xs mt-1">
                        Min discount: {alert.min_discount}%
                        {alert.max_price && <span className="ml-3">Max price: ${alert.max_price}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteAlert(alert.id)}
                      className="text-brand-gray text-xs hover:text-brand-red px-3 py-1.5">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="bg-brand-dark-3 border border-white/5 rounded-xl p-6 max-w-2xl">
              <h3 className="text-white font-bold mb-4">Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-brand-gray">Email</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-brand-gray">Username</span>
                  <span className="text-white">{user.username || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-brand-gray">Karma</span>
                  <span className="text-brand-red font-bold">{user.karma_score || 0}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-brand-gray">Country</span>
                  <span className="text-white">{user.country === 'CA' ? '🇨🇦 Canada' : '🇺🇸 United States'}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
