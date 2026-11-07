import { Metadata } from 'next'
import Link from 'next/link'
import { currentDraw, fmt, PRIZE, PRIZE_VALUE, SKILL_QUESTION } from '@/lib/contests'
import ContestEntry from '@/components/engage/ContestEntry'
import { SectionHead } from '@/components/ui/Editorial'

export const revalidate = 3600
export function generateMetadata(): Metadata {
  const d = currentDraw()
  return {
    title: `Giveaway: ${d.title} — Free to Enter`,
    description: `Enter the Daily.Deals monthly giveaway for ${d.monthLabel}. Prize: ${PRIZE}. Free to enter, no purchase necessary. Open to the US and Canada (excluding Quebec).`,
    alternates: { canonical: '/contests' },
  }
}

export default function ContestsPage() {
  const d = currentDraw()
  return (
    <main>
      <section className="border-b border-ink">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_1.1fr] gap-10">
          <div>
            <div className="section-eyebrow mb-3 text-accent">MONTHLY GIVEAWAY · FREE TO ENTER</div>
            <h1 className="font-serif text-5xl font-medium tracking-tight text-ink leading-[1.02] mb-5">{d.title}</h1>
            <p className="text-lg text-ink-2 leading-relaxed mb-6"><strong className="text-ink font-medium">Prize:</strong> {PRIZE}.</p>
            <dl className="grid grid-cols-2 gap-px bg-rule border border-rule mb-6">
              {[['Entries close', fmt(d.closes)], ['Winner drawn', fmt(d.drawDate)], ['Prize value', PRIZE_VALUE], ['Open to', 'US and Canada (excl. Quebec), 18+']].map(([k, v]) => (
                <div key={k} className="bg-white p-4"><dt className="section-eyebrow mb-1">{k}</dt><dd className="text-sm text-ink">{v}</dd></div>
              ))}
            </dl>
            <p className="text-sm text-ink-2 leading-relaxed mb-3">A new draw opens automatically on the first of every month. One entry per person per month. Prizes are funded by Daily.Deals supporters and sponsors.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/support#prizes" className="btn-outline">Fund a bigger prize</Link>
              <Link href="/advertise#sponsor" className="btn-outline">Sponsor a giveaway</Link>
            </div>
          </div>
          <div className="border border-ink p-6 sm:p-8 bg-white">
            <h2 className="font-serif text-2xl text-ink mb-5">Enter now</h2>
            <ContestEntry drawId={d.id} skillQuestion={SKILL_QUESTION} />
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <section>
          <SectionHead n="01" eyebrow="HOW IT WORKS" title="Three steps, thirty seconds" />
          <ol className="grid sm:grid-cols-3 gap-px bg-rule border border-rule">
            {[['Enter', 'Fill in the form with your name, email and region.'], ['Wait for the draw', `We draw one winner at random on ${fmt(d.drawDate)}.`], ['Claim', 'The winner is emailed and has 14 days to reply and claim the prize.']].map(([t, s], i) => (
              <li key={t} className="bg-white p-5"><div className="font-serif text-3xl text-accent mb-1">{i + 1}</div><div className="font-medium text-ink">{t}</div><p className="text-sm text-ink-2">{s}</p></li>
            ))}
          </ol>
        </section>
        <section>
          <SectionHead n="02" eyebrow="COMMUNITY CHALLENGES" title="Deal Hunter of the Month" sub="Submit great deals during the month. Our editors recognize the most useful contributor on the site and in the newsletter." />
          <Link href="/submit" className="btn-primary">Submit a deal →</Link>
        </section>
        <p className="text-xs text-ink-muted">NO PURCHASE NECESSARY. Void where prohibited. Open to legal residents of the 50 United States and D.C. and of Canada (excluding Quebec) who are 18 or older or the age of majority in their jurisdiction. Canadian winners must correctly answer a skill-testing question. Odds depend on the number of eligible entries. Sponsor: Webworks (operator of Daily.Deals). This giveaway is not sponsored, endorsed or administered by, or associated with, any retailer named. <Link href="/contests/rules" className="underline">Official Rules</Link>.</p>
      </div>
    </main>
  )
}
