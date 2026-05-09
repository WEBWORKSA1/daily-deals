import type { RawDeal } from './types'
import { fetchHTML } from './utils'
import { parseAmazonHtml } from './amazon-us'

export async function scrapeAmazonCA(): Promise<RawDeal[]> {
  const html = await fetchHTML('https://www.amazon.ca/deals')
  return parseAmazonHtml(html, 'CA', 'amazon-ca', 'Amazon Canada')
}
