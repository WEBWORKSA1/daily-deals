import type { RawDeal } from './types'
import { scrapeBestBuyImpl } from './bestbuy-us'

export async function scrapeBestBuyCA(): Promise<RawDeal[]> {
  return scrapeBestBuyImpl('CA', 'bestbuy-ca', 'Best Buy CA', 'https://www.bestbuy.ca/en-ca/event/top-deals/blta1f1aa1f1aaaaaaa')
}
