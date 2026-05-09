import type { RawDeal } from './types'
import { scrapeWalmartImpl } from './walmart-us'

export async function scrapeWalmartCA(): Promise<RawDeal[]> {
  return scrapeWalmartImpl('CA', 'walmart-ca', 'Walmart Canada', 'https://www.walmart.ca/en/deals')
}
