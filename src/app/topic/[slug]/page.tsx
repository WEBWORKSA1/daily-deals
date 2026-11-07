import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DealCard from '@/components/deals/DealCard'
import { getDeals } from '@/lib/data'
import { Deal } from '@/types'

export const revalidate = 3600

interface Props { params: { slug: string } }

const PAGES: Record<string, any> = {
  'best-deals-today': {
    title: 'Best Deals Today',
    h1: 'Best Deals Today',
    description: "The top deals across the US and Canada — ranked by real savings and refreshed throughout the day.",
    intro: "Every day we surface the highest-quality discounts, flash sales, and clearance deals so you never miss a price drop. Sorted by our Hotness Score — a 0-100 rating that combines discount depth, popularity, and editorial quality.",
    filter: { sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['best deals today', 'top deals today', 'best deals online', "today's deals"],
    faq: [
      { q: "How are these deals selected?", a: "Our editors and Hotness Score algorithm combine to surface the highest-quality discounts. Deals are ranked by discount depth, freshness, price credibility and shopper activity, with duplicates removed." },
      { q: "How often are deals updated?", a: "Continuously throughout the day. New deals appear hourly. Expired deals are removed automatically." },
      { q: "Are these affiliate links?", a: "Yes — when you purchase through our links, we may earn a small commission at no extra cost to you. This funds our editorial team and keeps Daily.Deals free." },
    ],
  },
  'amazon-deals-today': {
    title: 'Amazon Deals Today',
    h1: "Today's Best Amazon Deals",
    description: "Amazon's best discounts right now — lightning deals, daily savings, and deep clearance.",
    intro: "Amazon runs hundreds of lightning deals every day, but most last only a few hours. We surface the ones with genuine discounts (not fake \"was $X\" prices). Includes Prime-exclusive deals.",
    filter: { retailer_slug: 'amazon', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['amazon deals today', 'amazon lightning deals', 'amazon daily deals'],
    faq: [
      { q: "Do I need Amazon Prime?", a: "Most deals are available to anyone, though some lightning deals offer early access to Prime members." },
      { q: "How quickly do these deals expire?", a: "Lightning deals typically last 4-12 hours. Regular daily deals last 24 hours. Always check the timer on each deal." },
    ],
  },
  'best-laptop-deals': {
    title: 'Best Laptop Deals',
    h1: 'Best Laptop Deals — US & Canada',
    description: "Save hundreds on MacBooks, Dell XPS, Lenovo ThinkPad, HP, and more.",
    intro: "Laptops are one of the biggest purchases most people make. We rank laptop deals by how real the discount is, how current the model is, and how reputable the seller is.",
    filter: { category: 'electronics', search: 'laptop', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['best laptop deals', 'laptop deals today', 'cheap laptops'],
    faq: [
      { q: "How do I know if a laptop deal is real?", a: "Compare the exact model number across retailers and check its price history — a real deal is at or near its lowest recent price." },
      { q: "Should I buy refurbished?", a: "Manufacturer-refurbished laptops from Apple, Dell, and Lenovo carry full warranties and save 20-40%. Check the warranty length before you buy." },
    ],
  },
  'best-phone-deals': {
    title: 'Best Phone Deals',
    h1: 'Best Phone & Smartphone Deals',
    description: "iPhone, Samsung Galaxy, Pixel, and unlocked phone deals.",
    intro: "Smartphone deals are tricky because carrier promotions often hide the true price. We focus on unlocked phones with transparent discounts so you can compare apples to apples.",
    filter: { category: 'electronics', search: 'phone', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['best phone deals', 'iphone deals today', 'smartphone deals'],
    faq: [
      { q: "Should I buy unlocked or carrier?", a: "Unlocked phones give you flexibility and resale value. Carrier deals can save more upfront but lock you in." },
    ],
  },
  'best-tv-deals': {
    title: 'Best TV Deals',
    h1: 'Best TV Deals — 4K, OLED, QLED',
    description: "Save on Samsung, LG, Sony, TCL, and Hisense TVs.",
    intro: "TV pricing is brutal — manufacturers refresh models annually and inflate MSRPs. Our editors track real street prices to make sure your discount is genuine.",
    filter: { category: 'electronics', search: 'tv', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['best tv deals', 'tv deals today', '4k tv sale'],
    faq: [
      { q: "When are TVs cheapest?", a: "Black Friday week and Super Bowl week (mid-January) consistently produce the lowest prices of the year." },
    ],
  },
  'best-gaming-deals': {
    title: 'Best Gaming Deals',
    h1: 'Best Gaming Deals — Consoles, Games, Accessories',
    description: "PlayStation 5, Xbox, Nintendo Switch, PC games, and accessories.",
    intro: "Gaming hardware rarely goes on sale, but accessories, games, and last-gen consoles offer real discounts. We rank them by real discount and freshness.",
    filter: { category: 'gaming', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['best gaming deals', 'video game deals today'],
    faq: [
      { q: "Are PS5 / Xbox bundles ever discounted?", a: "Yes, but rarely on hardware itself. Most savings come from bundled games or extra controllers." },
    ],
  },
  'walmart-deals-today': {
    title: 'Walmart Deals Today',
    h1: "Today's Walmart Deals",
    description: "Best discounts at Walmart right now.",
    intro: "Walmart's rollback prices and Black Friday-style flash sales offer real savings on electronics, home goods, and everyday essentials.",
    filter: { retailer_slug: 'walmart', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['walmart deals today', 'walmart rollback'],
    faq: [],
  },
  'cheap-gadgets-deals': {
    title: 'Cheap Gadget Deals Under $50',
    h1: 'Cheap Gadgets Under $50',
    description: "Affordable tech, accessories, and gadgets — all under $50.",
    intro: "Great gifts, stocking stuffers, or just everyday upgrades. Hand-picked tech deals where the total price is $50 or less.",
    filter: { max_price: 50, category: 'electronics', sort: 'hotness_score', sortDir: 'desc' },
    keywords: ['cheap gadgets deals', 'tech under 50'],
    faq: [],
  },
  'black-friday-deals': {
    title: 'Black Friday Deals',
    h1: 'Black Friday Deals — Live Now',
    description: "The biggest Black Friday sale of the year.",
    intro: "Black Friday and Cyber Monday produce the lowest prices of the year on most electronics, appliances, and household goods. We rank the genuine discounts from major retailers as they appear.",
    filter: { sort: 'discount_percent', sortDir: 'desc', min_discount: 30 },
    keywords: ['black friday deals', 'cyber monday deals', 'best black friday deals'],
    faq: [
      { q: "When does Black Friday actually start?", a: "Most retailers start releasing Black Friday deals in early November, with the biggest discounts on Thanksgiving night through Cyber Monday." },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(PAGES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = PAGES[params.slug]
  if (!config) return { title: 'Page not found' }
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: { canonical: `/topic/${params.slug}` },
    openGraph: {
      type: 'website',
      title: config.title,
      description: config.description,
      url: `https://daily.deals/topic/${params.slug}`,
    },
  }
}

async function fetchDeals(filter: any): Promise<Deal[]> {
  const deals = await getDeals({
    feed: filter.max_price ? 'under50' : 'hot',
    category: filter.category,
    store: filter.retailer_slug,
    q: filter.search,
    limit: 40,
  })
  return filter.min_discount ? deals.filter(d => (d.discount_percent || 0) >= filter.min_discount).concat(deals.filter(d => (d.discount_percent || 0) < filter.min_discount)).slice(0, 40) : deals
}

export default async function TopicPage({ params }: Props) {
  const config = PAGES[params.slug]
  if (!config) return notFound()

  const deals = await fetchDeals(config.filter)

  const faqSchema = config.faq && config.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faq.map((item: any) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  } : null

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": config.h1,
    "description": config.description,
    "numberOfItems": deals.length,
    "itemListElement": deals.slice(0, 10).map((d: Deal, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://daily.deals/deal/${d.id}`,
      "name": d.title,
    })),
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      {faqSchema && (
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <main>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10 max-w-4xl">
            <div className="text-xs text-brand-gray mb-3">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-ink">{config.title}</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-medium text-ink uppercase tracking-tight mb-4">
              {config.h1}
            </h1>
            <p className="text-brand-gray-2 text-base md:text-lg leading-relaxed">{config.intro}</p>
            <p className="text-brand-gray text-xs mt-3">
              {deals.length} active deals · Updated {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </header>

          {deals.length > 0 ? (
            <section className="mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {deals.map(d => <DealCard key={d.id} deal={d} />)}
              </div>
            </section>
          ) : (
            <div className="bg-brand-dark-3 border border-rule rounded-xl p-10 text-center mb-12">
              <p className="text-brand-gray">No deals match this filter right now. Check back soon — we update deals every hour.</p>
              <Link href="/" className="inline-block mt-4 text-brand-red hover:text-accent font-bold">
                ← Browse all deals
              </Link>
            </div>
          )}

          {config.faq && config.faq.length > 0 && (
            <section className="max-w-4xl">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-ink uppercase mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {config.faq.map((item: any, i: number) => (
                  <details key={i} className="bg-brand-dark-3 border border-rule rounded-lg p-5 group">
                    <summary className="cursor-pointer text-ink font-bold list-none flex items-center justify-between">
                      <span>{item.q}</span>
                      <span className="text-brand-red group-open:rotate-45 transition-transform text-xl">+</span>
                    </summary>
                    <p className="text-brand-gray-2 mt-3 leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 max-w-4xl">
            <h2 className="font-heading text-xl font-medium text-ink uppercase mb-4">
              Related Deal Pages
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PAGES)
                .filter(([slug]) => slug !== params.slug)
                .slice(0, 8)
                .map(([slug, page]: any) => (
                  <Link key={slug} href={`/topic/${slug}`}
                    className="bg-brand-dark-3 hover:bg-brand-dark-4 border border-rule hover:border-brand-red/40
                               text-brand-gray-2 hover:text-accent text-xs font-medium
                               px-3 py-2 rounded-md transition-all">
                    {page.title}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>

    </>
  )
}
