import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Daily.Deals Extension — Find better deals while you shop',
  description: 'Install the Daily.Deals browser extension. Get notified when there\'s a hotter deal while shopping on Amazon, Walmart, Best Buy, and 16 other retailers.',
}

export default function ExtensionPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-brand-red/20 text-brand-red text-xs font-bold uppercase rounded-full mb-4">
              Browser Extension · v1.0
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-900 text-white uppercase tracking-tight leading-none">
              Find Better Deals.<br/>
              <span className="text-brand-red">Automatically.</span>
            </h1>
            <p className="text-brand-gray text-lg mt-6 max-w-2xl mx-auto">
              While you shop on Amazon, Walmart, Best Buy and 16 other retailers,
              we'll quietly check Daily.Deals and let you know if there's a hotter deal.
            </p>
          </div>

          {/* Install steps */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="font-heading text-2xl font-900 text-white uppercase mb-6">
              Install in 60 seconds
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-red text-white font-900 flex items-center justify-center">1</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Download the extension</h3>
                  <p className="text-brand-gray text-sm mb-3">Grab the ZIP file containing the extension.</p>
                  <Link
                    href="/api/extension/download"
                    className="inline-block bg-brand-red hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded text-sm"
                  >
                    Download daily-deals-extension.zip
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-red text-white font-900 flex items-center justify-center">2</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Unzip it</h3>
                  <p className="text-brand-gray text-sm">
                    Extract the ZIP file to any folder. Remember where you put it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-red text-white font-900 flex items-center justify-center">3</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Load it in your browser</h3>
                  <div className="text-brand-gray text-sm space-y-2">
                    <p><strong className="text-white">Chrome / Edge / Brave:</strong></p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs">chrome://extensions</code></li>
                      <li>Toggle on <strong>Developer mode</strong> in the top right</li>
                      <li>Click <strong>Load unpacked</strong> and select the unzipped folder</li>
                    </ol>
                    <p className="mt-3"><strong className="text-white">Firefox:</strong></p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Go to <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs">about:debugging#/runtime/this-firefox</code></li>
                      <li>Click <strong>Load Temporary Add-on</strong></li>
                      <li>Select the <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs">manifest.json</code> file in the folder</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white font-900 flex items-center justify-center">✓</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Start shopping</h3>
                  <p className="text-brand-gray text-sm">
                    Visit any product page on a supported retailer.
                    A red Daily.Deals banner will appear if there's a hotter deal we know about.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supported retailers */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="font-heading text-2xl font-900 text-white uppercase mb-6">
              Works with 19 major retailers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
              {[
                'Amazon (US + CA)', 'Walmart (US + CA)', 'Best Buy', 'Target',
                'Costco', 'Home Depot', 'Lowes', 'Apple',
                'Nike', 'Sephora', 'Ulta', 'Macy\'s',
                'Nordstrom', 'eBay'
              ].map(name => (
                <div key={name} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-brand-gray">
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="font-heading text-2xl font-900 text-white uppercase mb-4">
              Privacy
            </h2>
            <ul className="space-y-2 text-brand-gray text-sm">
              <li>✓ We only check the product title — no browsing history collected</li>
              <li>✓ No tracking, no analytics, no third-party cookies</li>
              <li>✓ The extension only runs on the 19 supported retailer domains</li>
              <li>✓ You can remove it from your browser at any time</li>
            </ul>
          </div>

          <div className="text-center">
            <Link
              href="/api/extension/download"
              className="inline-block bg-brand-red hover:bg-red-700 text-white font-900 px-8 py-4 rounded-lg text-lg uppercase tracking-tight"
            >
              Download Extension
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
