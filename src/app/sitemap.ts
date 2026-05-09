import { supabase } from '@/lib/db'
import { CATEGORIES } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // re-generate every hour

const BASE = 'https://daily.deals'

type SitemapEntry = {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const now = new Date()

  const staticPages: SitemapEntry[] = [
    { url: `${BASE}/`,                    lastModified: now, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${BASE}/deals/today`,         lastModified: now, changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${BASE}/deals/hot`,           lastModified: now, changeFrequency: 'hourly',  priority: 0.95 },
    { url: `${BASE}/deals/flash`,         lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/deals/clearance`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/deals/us`,            lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/deals/canada`,        lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/stores`,              lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/search`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/cashback`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/extension`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/for-you`,             lastModified: now, changeFrequency: 'daily',   priority: 0.5 },
    { url: `${BASE}/submit`,              lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/about`,               lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/terms`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/disclosure`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/contact`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  // High-intent SEO landing pages from /[slug]/page.tsx
  const seoLandingSlugs = [
    'best-deals-today', 'amazon-deals-today', 'walmart-deals-today',
    'best-laptop-deals', 'best-phone-deals', 'best-tv-deals',
    'best-gaming-deals', 'cheap-gadgets-deals', 'black-friday-deals',
  ]
  const seoLandingPages: SitemapEntry[] = seoLandingSlugs.map(slug => ({
    url: `${BASE}/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }))

  // Category pages
  const categoryPages: SitemapEntry[] = (CATEGORIES || []).map((c: any) => ({
    url: `${BASE}/category/${c.slug || c}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // Store pages — every active retailer
  let storePages: SitemapEntry[] = []
  try {
    const { data: retailers } = await supabase
      .from('retailers')
      .select('slug')
      .eq('is_active', true)
      .limit(1000)
    storePages = (retailers || []).map((r: any) => ({
      url: `${BASE}/store/${r.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    }))
  } catch {}

  // Deal detail pages — every active deal (using created_at as freshness signal)
  let dealPages: SitemapEntry[] = []
  try {
    const { data: deals } = await supabase
      .from('deals')
      .select('id, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5000)
    dealPages = (deals || []).map((d: any) => ({
      url: `${BASE}/deal/${d.id}`,
      lastModified: d.created_at ? new Date(d.created_at) : now,
      changeFrequency: 'daily',
      priority: 0.6,
    }))
  } catch {}

  return [...staticPages, ...seoLandingPages, ...categoryPages, ...storePages, ...dealPages]
}
