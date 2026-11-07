import { Metadata } from 'next'
import ConciergeInline from '@/components/forms/ConciergeInline'
import SmartForm from '@/components/forms/SmartForm'
import { SectionHead } from '@/components/ui/Editorial'

export const metadata: Metadata = {
  title: 'Deal Concierge — Free Price Watch & Deal Alerts',
  description: 'Tell Daily.Deals what you want to buy and the price you want to pay. We watch our deal sources around the clock and email you when it drops. Free for US and Canadian shoppers.',
  alternates: { canonical: '/concierge' },
}

const FAQ = [
  ['Is it really free?', 'Yes. Deal Concierge is free. We may earn a commission if you buy through our links — that is how we keep it free.'],
  ['How do you find matches?', 'Every time our deal feeds refresh, new deals are checked against active requests by product, category and price. Our team reviews larger or unusual requests.'],
  ['Will you spam me?', 'No. You receive matches for your request and the Daily Edition newsletter, and you can unsubscribe from either in one click.'],
  ['Can businesses use it?', 'Yes — if you buy in volume for a business, mention it in the notes and we will look for bulk and business pricing.'],
]

export default function ConciergePage() {
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <section className="border-b border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_1.15fr] gap-10">
          <div>
            <div className="section-eyebrow mb-3 text-accent">DEAL CONCIERGE · FREE</div>
            <h1 className="font-serif text-5xl lg:text-6xl font-medium tracking-tight text-ink leading-[1.0] mb-5">Name your price.<br />We’ll do the hunting.</h1>
            <p className="text-lg text-ink-2 leading-relaxed mb-8">Stop refreshing product pages. Tell us what you want and what you’d pay — our deal desk checks every source we track, all day, and emails you the moment it’s a match.</p>
            <ol className="space-y-5">
              {[['Tell us the product', 'A model number is best, but “a quiet dishwasher under $700” works too.'], ['Set your target', 'We only alert you at or under your price, in your country and currency.'], ['Get the alert, buy with confidence', 'Each alert links to the retailer so you can confirm the price and buy in seconds.']].map(([t, s], i) => (
                <li key={t} className="flex gap-4"><span className="font-serif text-3xl text-accent leading-none w-8">{i + 1}</span><div><div className="font-medium text-ink">{t}</div><p className="text-sm text-ink-2">{s}</p></div></li>
              ))}
            </ol>
          </div>
          <div className="border border-ink p-6 sm:p-8 bg-white"><ConciergeInline /></div>
        </div>
      </section>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-12">
        <section id="alerts">
          <SectionHead n="01" eyebrow="QUICK ALERT" title="Just want a category alert?" sub="Pick a category and how often you want to hear from us." />
          <SmartForm formType="alert" submitLabel="Create my alert →" successTitle="Alert created." successBody="You’ll get matching deals by email. Unsubscribe anytime."
            fields={[
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'country', label: 'Country', type: 'select', options: [['US', 'United States'], ['CA', 'Canada']], half: true, defaultValue: 'US' },
              { name: 'product', label: 'Category or keyword', required: true, placeholder: 'e.g. OLED TV, LEGO, running shoes' },
              { name: 'frequency', label: 'Frequency', type: 'radio', options: [['instant', 'As they happen'], ['daily', 'Daily digest'], ['weekly', 'Weekly roundup']], defaultValue: 'daily' },
              { name: 'min_discount', label: 'Minimum discount', type: 'select', options: ['Any', '20%+', '30%+', '50%+'], half: true },
            ]} />
        </section>
        <section>
          <SectionHead n="02" eyebrow="QUESTIONS" title="Frequently asked" />
          <div className="divide-y divide-rule border-y border-rule">
            {FAQ.map(([q, a]) => (<details key={q} className="py-4 group"><summary className="cursor-pointer font-medium text-ink list-none flex justify-between">{q}<span className="text-accent group-open:rotate-45 transition-transform">+</span></summary><p className="text-sm text-ink-2 mt-2">{a}</p></details>))}
          </div>
        </section>
      </div>
    </main>
  )
}
