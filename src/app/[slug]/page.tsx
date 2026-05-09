// This [slug] route was experimentally placed at the app root and would conflict
// with all the static top-level folders (/about, /cashback, /extension, etc.).
// It now redirects to /topic/<slug> where the actual SEO landing pages live.

import { redirect } from 'next/navigation'

interface Props { params: { slug: string } }

const KNOWN_SLUGS = new Set([
  'best-deals-today', 'amazon-deals-today', 'walmart-deals-today',
  'best-laptop-deals', 'best-phone-deals', 'best-tv-deals',
  'best-gaming-deals', 'cheap-gadgets-deals', 'black-friday-deals',
])

export async function generateStaticParams() {
  // Only generate for known SEO slugs so Next doesn't try to build all
  // top-level routes (which would conflict with static folders).
  return Array.from(KNOWN_SLUGS).map(slug => ({ slug }))
}

export const dynamicParams = false

export default function RootSlugRedirect({ params }: Props) {
  if (KNOWN_SLUGS.has(params.slug)) {
    redirect(`/topic/${params.slug}`)
  }
  // For all other slugs, this won't render because dynamicParams=false makes them 404.
  return null
}
