// This file used to be src/app/[slug]/page.tsx but was relocated to /topic/[slug]/
// to avoid any chance of conflicting with top-level static routes (/about, /cashback, etc.).
// Now redirects /[old-slug] → /topic/[old-slug] would require a redirect rule.
// Instead, we just remove this file's logic and keep the URLs at /topic/[slug].

// Returning a stub here just to make Next happy if any old code references this path.
// Realistically this file no longer matches any URL because we removed it from app/.
export default function Stub() {
  return null
}
