// Central registry of all retailer scrapers.
// Add a new scraper: import its scrape() function, register it here.

import type { RawDeal } from './types'
import { scrapeAmazonUS } from './amazon-us'
import { scrapeAmazonCA } from './amazon-ca'
import { scrapeWalmartUS } from './walmart-us'
import { scrapeWalmartCA } from './walmart-ca'
import { scrapeBestBuyUS } from './bestbuy-us'
import { scrapeBestBuyCA } from './bestbuy-ca'
import { scrapeTarget } from './target'
import { scrapeCostco } from './costco'
import { scrapeHomeDepot } from './homedepot'
import { scrapeLowes } from './lowes'
import { scrapeKohls } from './kohls'
import { scrapeMacys } from './macys'
import { scrapeNewegg } from './newegg'
import { scrapeCanadianTire } from './canadiantire'
import { scrapeIndigo } from './indigo'

export interface ScraperEntry {
  slug: string
  name: string
  country: 'US' | 'CA'
  scrape: () => Promise<RawDeal[]>
  enabled: boolean
}

export const SCRAPERS: ScraperEntry[] = [
  { slug: 'amazon-us',     name: 'Amazon',         country: 'US', scrape: scrapeAmazonUS,     enabled: true },
  { slug: 'amazon-ca',     name: 'Amazon Canada',  country: 'CA', scrape: scrapeAmazonCA,     enabled: true },
  { slug: 'walmart-us',    name: 'Walmart',        country: 'US', scrape: scrapeWalmartUS,    enabled: true },
  { slug: 'walmart-ca',    name: 'Walmart Canada', country: 'CA', scrape: scrapeWalmartCA,    enabled: true },
  { slug: 'bestbuy-us',    name: 'Best Buy',       country: 'US', scrape: scrapeBestBuyUS,    enabled: true },
  { slug: 'bestbuy-ca',    name: 'Best Buy CA',    country: 'CA', scrape: scrapeBestBuyCA,    enabled: true },
  { slug: 'target',        name: 'Target',         country: 'US', scrape: scrapeTarget,       enabled: true },
  { slug: 'costco',        name: 'Costco',         country: 'US', scrape: scrapeCostco,       enabled: true },
  { slug: 'homedepot',     name: 'Home Depot',     country: 'US', scrape: scrapeHomeDepot,    enabled: true },
  { slug: 'lowes',         name: "Lowe's",         country: 'US', scrape: scrapeLowes,        enabled: true },
  { slug: 'kohls',         name: "Kohl's",         country: 'US', scrape: scrapeKohls,        enabled: true },
  { slug: 'macys',         name: "Macy's",         country: 'US', scrape: scrapeMacys,        enabled: true },
  { slug: 'newegg',        name: 'Newegg',         country: 'US', scrape: scrapeNewegg,       enabled: true },
  { slug: 'canadiantire',  name: 'Canadian Tire',  country: 'CA', scrape: scrapeCanadianTire, enabled: true },
  { slug: 'indigo',        name: 'Indigo',         country: 'CA', scrape: scrapeIndigo,       enabled: true },
]

export function getScraper(slug: string): ScraperEntry | null {
  return SCRAPERS.find(s => s.slug === slug) || null
}
