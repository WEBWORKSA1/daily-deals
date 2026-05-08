import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Daily.Deals — Best Deals Today | US & Canada', template: '%s | Daily.Deals' },
  description: "Find today's best deals from 1000+ top retailers across the US and Canada. Personalized by your location — updated every 24 hours.",
  keywords: ['daily deals', 'best deals today', 'coupons', 'discounts', 'amazon deals', 'walmart deals', 'Canada deals'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://daily.deals'),
  openGraph: { type: 'website', siteName: 'Daily.Deals' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-brand-dark text-white font-body antialiased">{children}</body>
    </html>
  )
}
