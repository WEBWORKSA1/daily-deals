import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TopBanner from '@/components/layout/TopBanner'
import ConsentBanner from '@/components/layout/ConsentBanner'
import { ADSENSE_CLIENT, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: { default: 'Daily.Deals — Best Deals Today | US & Canada', template: '%s | Daily.Deals' },
  description: "Today's best deals, coupons and price drops from major US and Canadian retailers — scored, de-duplicated and refreshed around the clock. Free deal alerts, guides and monthly giveaways.",
  keywords: ['daily deals', 'best deals today', 'coupons', 'discounts', 'amazon deals', 'walmart deals', 'Canada deals'],
  metadataBase: new URL(SITE_URL),
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
    description: "Today's best deals from major US and Canadian retailers, refreshed around the clock.",
    images: [{ url: 'https://daily.deals/icon.svg', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily.Deals',
    description: "Today's best deals — refreshed around the clock.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const SKIMLINKS_ID = process.env.NEXT_PUBLIC_SKIMLINKS_ID
  || process.env.SKIMLINKS_PUBLISHER_ID
  || '302790X1790814'

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Daily.Deals",
  "url": "https://daily.deals",
  "logo": "https://daily.deals/icon.svg",
  "description": "Daily.Deals curates the best discounts, coupons, and price drops from major retailers across the US and Canada.",
  "sameAs": [],
  "contactPoint": [{ "@type": "ContactPoint", "contactType": "customer support", "url": "https://daily.deals/contact" }],
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
        {/* Editorial type system: Newsreader (serif display), DM Sans (body), Barlow Condensed (legacy), JetBrains Mono (numbers) */}
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=DM+Sans:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        {/* Google Consent Mode v2 defaults — denied in EEA/UK/CH until the visitor chooses; granted elsewhere. */}
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'],wait_for_update:500});` }} />
        {/* Google AdSense — site-wide (verification + Auto ads) */}
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous"></script>
        {/* JSON-LD schemas */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }} />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
      </head>
      <body className="bg-paper text-ink font-body antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[70] focus:bg-white focus:p-3">Skip to content</a>
        <TopBanner />
        <Header />
        <div id="main">{children}</div>
        <Footer />
        <ConsentBanner />
        {/*
          Skimlinks safety net — rewrites any retailer link we didn't already
          server-side wrap (legacy pages, blog content, footer outbound links).
          Our primary path is server-side via /api/clicks + buildAffiliateLink,
          which is ad-blocker proof. This script is the belt+suspenders layer.
        */}
        <Script id="skimlinks" strategy="afterInteractive"
          src={`https://s.skimresources.com/js/${SKIMLINKS_ID}.skimlinks.js`} />
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
