'use client'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle'|'sending'|'done'>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

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
        <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Get in Touch</span>
        <h1 className="font-heading text-5xl font-900 text-white uppercase mt-2 mb-2">Contact Us</h1>
        <p className="text-brand-gray text-sm mb-10">Questions, partnerships, or advertising inquiries — we'd love to hear from you.</p>

        {status === 'done' ? (
          <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-heading text-2xl text-white uppercase mb-2">Message Sent</h2>
            <p className="text-brand-gray text-sm">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className="input-dark" />
              </div>
              <div>
                <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="input-dark" />
              </div>
            </div>
            <div>
              <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Subject</label>
              <select name="subject" value={form.subject} onChange={handleChange} required className="input-dark">
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="advertising">Advertising & Partnerships</option>
                <option value="deal">Submit a Deal</option>
                <option value="error">Report an Error</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-brand-gray-2 text-xs font-bold uppercase tracking-wider block mb-2">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={6} placeholder="Tell us what's on your mind..." className="input-dark resize-none" />
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center py-4">
              {status === 'sending' ? 'Sending...' : 'Send Message →'}
            </button>
          </form>
        )}

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['📧', 'Email', 'hello@daily.deals'],
            ['💼', 'Advertising', 'ads@daily.deals'],
            ['🤝', 'Partnerships', 'partners@daily.deals'],
          ].map(([icon, label, value]) => (
            <div key={label} className="bg-brand-dark-3 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-brand-gray text-xs uppercase tracking-wider mb-1">{label}</div>
              <div className="text-white text-xs font-medium">{value}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
