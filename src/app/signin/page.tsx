'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErr(json.error || 'Failed')
      } else {
        router.push('/account')
      }
    } catch (e: any) {
      setErr(e?.message || 'Network error')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-brand-dark-3 border border-white/5 rounded-2xl p-8 shadow-card">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-red/15
                              border border-brand-red/25 rounded-2xl text-2xl mb-4">
                🔥
              </div>
              <h1 className="font-heading text-2xl font-900 text-white uppercase mb-1">Sign In</h1>
              <p className="text-brand-gray text-xs">No password — just enter your email</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="input-dark w-full h-11" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-brand-gray text-xs uppercase tracking-wider block mb-1.5">
                  Username <span className="text-brand-gray opacity-60 normal-case">(optional, new users only)</span>
                </label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className="input-dark w-full h-11" placeholder="dealhunter47" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                {loading ? 'Signing in...' : 'Continue →'}
              </button>

              {err && <p className="text-brand-red text-xs text-center">{err}</p>}
            </form>

            <p className="text-brand-gray text-xs text-center mt-6">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-white hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-white hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
