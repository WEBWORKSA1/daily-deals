import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { getLiveFeed } from '@/lib/feeds/live'
import { getVideos } from '@/lib/videos'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret || req.nextUrl.searchParams.get('secret') === secret
}

// Called by the hourly Netlify cron: expires the live-deal + video caches and re-warms
// them, so the first visitor of every hour never waits on upstream feeds.
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const t0 = Date.now()
  revalidateTag('live-deals')
  revalidateTag('videos')
  const [feed, videos] = await Promise.all([getLiveFeed().catch(() => null), getVideos().catch(() => [])])
  for (const p of ['/', '/deals/hot', '/deals/today', '/deals/flash', '/deals/us', '/deals/canada', '/videos']) revalidatePath(p)
  return NextResponse.json({
    ok: true, ms: Date.now() - t0,
    live_deals: feed?.deals.length || 0,
    sources: feed?.sources || [],
    videos: videos.length,
  })
}

export async function GET(req: NextRequest) { return POST(req) }
