import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Daily.Deals — Best Deals Today | US & Canada', template: '%s | Daily.Deals' },
  description: "Find today's best deals from 1000+ top retailers across the US and Canada. Personalized by your location — updated every 24 hours.",
  keywords: ['daily deals', 'best deals today', 'coupons', 'discounts', 'amazon deals', 'walmart deals', 'Canada deals'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://daily.deals'),
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
    shortcut: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Daily.Deals',
  },
  openGraph: {
    type: 'website',
    siteName: 'Daily.Deals',
    url: 'https://daily.deals',
    title: "Daily.Deals — Best Deals Today | US & Canada",
    description: "Find today's best deals from 1000+ top retailers across the US and Canada.",
    images: [{ url: 'https://daily.deals/icon.svg', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily.Deals',
    description: "Today's best deals — updated every 24 hours.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Daily.Deals",
  "url": "https://daily.deals",
  "logo": "https://daily.deals/icon.svg",
  "description": "Daily.Deals aggregates the best discounts, coupons, and price drops from 1000+ retailers across the US and Canada.",
  "sameAs": [],
}

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Daily.Deals",
  "url": "https://daily.deals",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://daily.deals/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Script id="org-schema" type="application/ld+json" strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }} />
        <Script id="website-schema" type="application/ld+json" strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
      </head>
      <body className="bg-brand-dark text-white font-body antialiased">
        {children}
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {})
            })
          }
        `}</Script>
      </body>
    </html>
  )
}
