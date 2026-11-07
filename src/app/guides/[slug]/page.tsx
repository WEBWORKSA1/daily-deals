import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDES, getGuide } from '@/lib/guides'
import { Prose, DealGrid } from '@/components/ui/Editorial'
import AdSlot from '@/components/ads/AdSlot'
import ConciergeInline from '@/components/forms/ConciergeInline'
import ShareLinks from '@/components/ui/ShareLinks'
import { getDeals } from '@/lib/data'
import { SITE_URL } from '@/lib/site'

export const revalidate = 1800
interface Props { params: { slug: string } }

export function generateStaticParams() { return GUIDES.map(g => ({ slug: g.slug })) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide(params.slug)
  if (!g) return { title: 'Guide not found' }
  return {
    title: g.title, description: g.dek,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { type: 'article', title: g.title, description: g.dek, url: `${SITE_URL}/guides/${g.slug}` },
  }
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide(params.slug)
  if (!g) notFound()
  const picks = await getDeals({ feed: 'hot', limit: 4 })
  const more = GUIDES.filter(x => x.slug !== g.slug).slice(0, 4)
  const article = {
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.dek,
    dateModified: g.updated, datePublished: g.updated, author: { '@type': 'Organization', name: 'Daily.Deals Editors' },
    publisher: { '@type': 'Organization', name: 'Daily.Deals', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` } },
    mainEntityOfPage: `${SITE_URL}/guides/${g.slug}`,
  }
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-xs text-ink-muted mb-6"><Link href="/guides" className="hover:text-ink">Guides</Link> / {g.topic}</div>
        <div className="section-eyebrow mb-3">{g.topic.toUpperCase()} · {g.minutes} MIN READ</div>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-ink leading-[1.05] mb-4">{g.title}</h1>
        <p className="text-lg text-ink-2 leading-relaxed mb-4">{g.dek}</p>
        <div className="text-xs text-ink-muted border-b border-rule pb-6 mb-8">By the Daily.Deals editors · Updated {new Date(g.updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <Prose sections={g.sections.slice(0, 2)} />
        <AdSlot kind="article" />
        <Prose sections={g.sections.slice(2)} />
        {g.related && (
          <div className="mt-10 flex flex-wrap gap-3">
            {g.related.map(([l, h]) => <Link key={h} href={h} className="btn-outline">{l} →</Link>)}
          </div>
        )}
        <div className="mt-8"><ShareLinks path={`/guides/${g.slug}`} title={g.title} /></div>
        <section className="mt-12 border border-ink p-6 sm:p-8">
          <div className="section-eyebrow mb-2 text-accent">PUT IT TO WORK</div>
          <h2 className="font-serif text-2xl text-ink mb-4">Tell us what you’re shopping for</h2>
          <ConciergeInline compact />
        </section>
      </article>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-12">
        {picks.length > 0 && (<section><div className="section-eyebrow mb-2">FROM TODAY’S EDITION</div><h2 className="section-h2 mb-5">Deals worth a look</h2><DealGrid deals={picks} /></section>)}
        <section>
          <div className="section-eyebrow mb-2">KEEP READING</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {more.map(m => <Link key={m.slug} href={`/guides/${m.slug}`} className="bg-white p-5 hover:bg-paper-2"><div className="font-serif text-lg text-ink leading-snug">{m.title}</div><div className="text-xs text-ink-muted mt-1">{m.minutes} min read</div></Link>)}
          </div>
        </section>
      </div>
    </main>
  )
}
