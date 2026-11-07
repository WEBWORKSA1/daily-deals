// Server-side wrapper for /search.
// We MUST wrap the client component (which uses useSearchParams()) in <Suspense>,
// otherwise Next.js 14 throws a "missing-suspense-with-csr-bailout" prerender error.
// See: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const metadata = {
  title: 'Search Daily Deals',
  description: 'Search across thousands of deals from major retailers in the US and Canada.',
}

// Static fallback shown while the client component is hydrating.
// Renders identical chrome (header/footer + skeleton grid) to avoid layout shift.
function SearchFallback() {
  return (
    <>

      <main>
        <section className="bg-brand-dark-3 border-b border-rule py-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-medium text-ink uppercase tracking-tight">
              Search Daily Deals
            </h1>
            <p className="text-brand-gray text-sm mt-1">Loading search…</p>
          </div>
        </section>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside>
            <div className="bg-brand-dark-3 border border-rule rounded-xl h-96 animate-pulse" />
          </aside>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-dark-3 border border-rule rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </main>

    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  )
}
