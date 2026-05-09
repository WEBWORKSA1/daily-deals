// This dynamic route at the app root would conflict with static top-level routes
// like /about, /cashback, /extension. Use /topic/[slug] instead — see app/topic/[slug]/page.tsx.
// This file exists only to mark the directory; Next will only render it when a slug
// is provided that isn't matched by any static folder, and we 404 those.

import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

export default function NotFoundRoute() {
  notFound()
}

// Empty static params — this route should never render at build time.
export async function generateStaticParams() {
  return []
}

export const dynamicParams = false
