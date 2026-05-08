'use client'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function SubmitDealPage() {
  const [status, setStatus] = useState<'idle'|'sending'|'done'>('idle')
  const [form, setForm] = useState({ title: '', url: '', store: '', original_price: '', deal_price: '', coupon_code: '', category: '', country: 'US', notes: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('done')
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Community</span>
        <h1 className="font-heading text-5xl font-900 text-white uppercase mt-2 mb-2">Submit a Deal</h1>
        <p className="text-brand-gray text-sm mb-10">Found a great deal? Share it with the Daily.Deals community. Our team reviews all submissions within 24 hours.</p>

        {status === 'done' ? (
          <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-heading text-2xl text-white uppercase mb-2">Deal Submitted!</h2>
            <p className="text-brand-gray text-sm">Our team will review it within 24 hours. Thank you for contributing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Deal Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Apple AirPods Pro 2nd Gen" className="input-dark" />
            </div>
            <div>
              <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Deal URL *</label>
              <input name="url" type="url" value={form.url} onChange={handleChange} required placeholder="https://..." className="input-dark" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Store Name *</label>
                <input name="store" value={form.store} onChange={handleChange} required placeholder="Amazon, Walmart..." className="input-dark" />
              </div>
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Country *</label>
                <select name="country" value={form.country} onChange={handleChange} className="input-dark">
                  <option value="US">🇺🇸 United States</option>
                  <option value="CA">🇨🇦 Canada</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Original Price</label>
                <input name="original_price" value={form.original_price} onChange={handleChange} placeholder="$99.99" className="input-dark" />
              </div>
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Deal Price *</label>
                <input name="deal_price" value={form.deal_price} onChange={handleChange} required placeholder="$49.99" className="input-dark" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Coupon Code</label>
                <input name="coupon_code" value={form.coupon_code} onChange={handleChange} placeholder="SAVE20" className="input-dark" />
              </div>
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-dark">
                  <option value="">Select category</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home & Kitchen</option>
                  <option>Beauty</option>
                  <option>Sports</option>
                  <option>Gaming</option>
                  <option>Tools</option>
                  <option>Grocery</option>
                  <option>Automotive</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Additional Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any extra details about this deal..." className="input-dark resize-none" />
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center py-4">
              {status === 'sending' ? 'Submitting...' : 'Submit Deal →'}
            </button>
            <p className="text-brand-gray text-xs text-center">All submissions are reviewed by our team before publishing.</p>
          </form>
        )}
      </main>
      <Footer />
    </>
  )
}
