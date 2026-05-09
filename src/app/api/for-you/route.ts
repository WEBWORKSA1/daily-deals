import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { buildForYouFeed, getUserInsights } from '@/lib/forYou'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Sign in to use For You feed' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100)

  try {
    const [feed, insights] = await Promise.all([
      buildForYouFeed(user.id, limit),
      getUserInsights(user.id),
    ])
    return NextResponse.json({ feed, insights })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
