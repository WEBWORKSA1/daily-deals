import { MetadataRoute } from 'next'
import { supabase } from '@/lib/db'
import { CATEGORIES } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // re-generate every hour

const BASE = 'https://daily.deals'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
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

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = (CATEGORIES || []).map((c: any) => ({
    url: `${BASE}/category/${c.slug || c}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Store pages — every active retailer
  let storePages: MetadataRoute.Sitemap = []
  try {
    const { data: retailers } = await supabase
      .from('retailers')
      .select('slug, name')
      .eq('is_active', true)
      .limit(1000)
    storePages = (retailers || []).map((r: any) => ({
      url: `${BASE}/store/${r.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  } catch {}

  // Deal detail pages — every active deal
  let dealPages: MetadataRoute.Sitemap = []
  try {
    const { data: deals } = await supabase
      .from('deals')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5000)
    dealPages = (deals || []).map((d: any) => ({
      url: `${BASE}/deal/${d.id}`,
      lastModified: d.updated_at ? new Date(d.updated_at) : now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  } catch {}

  return [...staticPages, ...categoryPages, ...storePages, ...dealPages]
}
