// SEO landing pages live at /topic/[slug] — see app/topic/[slug]/page.tsx.
// This route exists with empty static params + dynamicParams=false, which means:
//   - At build time: no pages are generated for this dynamic segment.
//   - At runtime: any /[anything] URL returns 404 unless matched by a static folder.
// Static top-level routes (/about, /cashback, etc.) take priority and render normally.

interface Props { params: { slug: string } }

export const dynamicParams = false

export async function generateStaticParams() {
  // No slugs — this route never matches at build time.
  return []
}

export default function CatchAllSlug({ params }: Props) {
  // Unreachable at runtime when dynamicParams=false + empty staticParams.
  return null
}
