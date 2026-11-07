// Self-updating video hub. Pulls each channel's public YouTube RSS feed (no API key),
// caches for 6 hours, and groups by topic. A channel that fails is simply skipped.

import { unstable_cache } from 'next/cache'
import { tag, attr, decode } from '@/lib/feeds/parse'

export interface Video { id: string; title: string; channel: string; published: string; topic: string; thumb: string }

export const VIDEO_TOPICS = [
  { slug: 'tech', label: 'Tech reviews & buying advice' },
  { slug: 'money', label: 'Saving money & smart shopping' },
  { slug: 'home', label: 'Home, kitchen & tools' },
  { slug: 'gaming', label: 'Gaming & PC hardware' },
] as const

export const CHANNELS: Array<{ id: string; name: string; topic: string }> = [
  { id: 'UCBJycsmduvYEL83R_U4JriQ', name: 'Marques Brownlee', topic: 'tech' },
  { id: 'UCMiJRAwDNSNzuYeN2uWa0pA', name: 'Mrwhosetheboss', topic: 'tech' },
  { id: 'UCsTcErHg8oDvUnTzoqsYeNw', name: 'Unbox Therapy', topic: 'tech' },
  { id: 'UCVYamHliCI9rw1tHR1xbkfw', name: 'Dave2D', topic: 'tech' },
  { id: 'UCOmcA3f_RrH6b9NmcNa4tdg', name: 'CNET', topic: 'tech' },
  { id: 'UCddiUEpeqJcYeBxX1IVBKvQ', name: 'The Verge', topic: 'tech' },
  { id: 'UCOClvgLYa7g75eIaTdwj_vg', name: 'Consumer Reports', topic: 'money' },
  { id: 'UCL8w_A8p8P1HWI3k6PR5Z6w', name: 'Two Cents (PBS)', topic: 'money' },
  { id: 'UCxAS_aK7sS2x_bqnlJHDSHw', name: "America's Test Kitchen", topic: 'home' },
  { id: 'UCWFKCr40YwOZQx8FHU_ZqqQ', name: 'JerryRigEverything', topic: 'tech' },
  { id: 'UCXuqSBlHAE6Xw-yeJA0Tunw', name: 'Linus Tech Tips', topic: 'gaming' },
  { id: 'UCTzLRZUgelatKZ4nyIKcAbg', name: 'Hardware Canucks', topic: 'gaming' },
]

/** Topic searches shown when feeds are unreachable — always-useful fallbacks. */
export const VIDEO_SEARCHES: Array<[string, string]> = [
  ['Black Friday deals worth buying', 'black friday deals worth buying 2026'],
  ['Best budget laptops', 'best budget laptop review'],
  ['Is it actually a deal? Price tracking tips', 'how to tell if a sale is real price tracking'],
  ['Best air fryer tested', 'best air fryer tested review'],
  ['Best TV for the money', 'best tv for the money 2026'],
  ['Cashback & coupon stacking explained', 'cashback coupon stacking explained'],
]

async function pullChannel(c: { id: string; name: string; topic: string }): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DailyDealsBot/2.0; +https://daily.deals/about)' },
      signal: AbortSignal.timeout(7000), next: { revalidate: 21600, tags: ['videos'] },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
    return entries.slice(0, 4).map(e => {
      const id = tag(e, 'yt:videoId') || ''
      return {
        id,
        title: decode(tag(e, 'title') || ''),
        channel: c.name,
        published: tag(e, 'published') || new Date().toISOString(),
        topic: c.topic,
        thumb: attr(e, 'media:thumbnail', 'url') || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      }
    }).filter(v => /^[\w-]{11}$/.test(v.id) && !/#shorts/i.test(v.title))
  } catch { return [] }
}

async function collectVideos(): Promise<Video[]> {
  const all = (await Promise.all(CHANNELS.map(pullChannel))).flat()
  return all.sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
}

export const getVideos = unstable_cache(collectVideos, ['video-hub-v1'], { revalidate: 21600, tags: ['videos'] })
