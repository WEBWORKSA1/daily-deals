// Single source of truth for site-wide constants (safe for client + server).
// NOTE: no email address lives here — the only inbox is resolved server-side in lib/server/forms.ts.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://daily.deals').replace(/\/$/, '')
export const SITE_NAME = 'Daily.Deals'
export const OWNER_NAME = 'Webworks'

export const ADSENSE_CLIENT = 'ca-pub-6620975821265271'
export const ADSENSE_PUB = 'pub-6620975821265271'

// Sitewide inquiry banner target. Shown as link text only — the URL is never printed on the page.
export const INQUIRY_URL = 'https://web.works/contact'

export const AMAZON_US_TAG = process.env.NEXT_PUBLIC_AMAZON_US_TAG || 'dailydeal0dbc-20'
export const AMAZON_CA_TAG = process.env.NEXT_PUBLIC_AMAZON_CA_TAG || process.env.NEXT_PUBLIC_AMAZON_US_TAG || 'dailydeal0dbc-20'

export const NAV_PRIMARY: Array<[string, string]> = [
  ['Daily Hot', '/deals/hot'],
  ['Daily Flash', '/deals/flash'],
  ['Daily Clearance', '/deals/clearance'],
  ['Daily US', '/deals/us'],
  ['Daily Canadian', '/deals/canada'],
  ['Daily Edition', '/deals/today'],
  ['Coupons', '/coupons'],
  ['Guides', '/guides'],
  ['Videos', '/videos'],
  ['Deal Concierge', '/concierge'],
  ['Giveaways', '/contests'],
]

export const FOOTER_COLUMNS: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: 'Daily Deals',
    links: [
      ['Daily Hot', '/deals/hot'], ['Daily Flash', '/deals/flash'], ['Daily Clearance', '/deals/clearance'],
      ['Daily US', '/deals/us'], ['Daily Canadian', '/deals/canada'], ['The Daily Edition', '/deals/today'],
      ['All Stores', '/stores'], ['Coupons by Store', '/coupons'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Shopping Guides', '/guides'], ['Deal Videos', '/videos'], ['Price Alerts', '/concierge#alerts'],
      ['Cashback', '/cashback'], ['Browser Extension', '/extension'], ['Search', '/search'],
    ],
  },
  {
    title: 'Get Involved',
    links: [
      ['Deal Concierge', '/concierge'], ['Giveaways', '/contests'], ['Submit a Deal', '/submit'],
      ['Support Daily.Deals', '/support'], ['Careers', '/careers'], ['Advertise & Sponsor', '/advertise'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'], ['Contact', '/contact'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'],
      ['Affiliate Disclosure', '/disclosure'], ['Trademark & Copyright', '/legal'],
    ],
  },
]

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : '/' + path}`
}
