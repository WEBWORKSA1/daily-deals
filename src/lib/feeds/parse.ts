// Dependency-free, truncation-tolerant RSS 2.0 / Atom parsing + deal-text heuristics.

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™' }

export function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z0-9#]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
}

export function stripTags(html: string): string {
  return decode(html).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function tag(xml: string, name: string): string | null {
  const n = name.replace(':', '\\:')
  const m = xml.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'))
  return m ? decode(m[1]).trim() : null
}

export function attr(xml: string, name: string, attribute: string): string | null {
  const n = name.replace(':', '\\:')
  const m = xml.match(new RegExp(`<${n}\\b[^>]*\\b${attribute}=["']([^"']+)["']`, 'i'))
  return m ? decode(m[1]) : null
}

export interface FeedItem {
  title: string
  link: string
  description: string
  html: string
  published: string | null
  image: string | null
  categories: string[]
  raw: string
}

export function parseFeed(xml: string): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?(?:<\/item>|$)/gi) || xml.match(/<entry[\s>][\s\S]*?(?:<\/entry>|$)/gi) || []
  const items: FeedItem[] = []
  for (const b of blocks) {
    const title = stripTags(tag(b, 'title') || '')
    const link = tag(b, 'link') || attr(b, 'link', 'href') || tag(b, 'guid') || ''
    const html = tag(b, 'content:encoded') || tag(b, 'description') || tag(b, 'content') || tag(b, 'summary') || ''
    const imgInHtml = decode(html).match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null
    const image = attr(b, 'media:content', 'url') || attr(b, 'media:thumbnail', 'url') || attr(b, 'enclosure', 'url') || imgInHtml
    const categories = Array.from(b.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)).map(m => stripTags(m[1])).filter(Boolean)
    if (!title || !/^https?:\/\//.test(link.trim())) continue
    items.push({
      title, link: link.trim(), html, description: stripTags(html).slice(0, 600),
      published: tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'),
      image: image && /^https?:\/\//.test(image) ? image.replace(/&amp;/g, '&') : null,
      categories, raw: b,
    })
  }
  return items
}

// ── Deal heuristics ────────────────────────────────────────────────────────

const MONEY = /(?:C\$|CA\$|CAD\s?\$?|US\$|\$)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/g

function toNum(m: RegExpMatchArray): number {
  return parseFloat(m[1].replace(/,/g, '') + (m[2] ? '.' + m[2] : ''))
}

// Dollar amounts that are never the item's price: shipping/order thresholds ("free shipping
// w/ $99", "on $35+"), cart minimums, and money-off / reward amounts ("$10 off", "$5 back").
const AMT = String.raw`(?:C\$|CA\$|CAD\s?\$?|US\$|\$)\s?\d[\d,]*(?:\.\d{2})?`
const NOT_A_PRICE = [
  new RegExp(String.raw`\b(?:w\/|with|on|over|above|orders?(?:\s+(?:of|over))?|min(?:imum|\.)?(?:\s+(?:order|purchase|spend))?(?:\s+of)?|spend(?:ing)?|purchases?\s+of|when you (?:spend|buy))\s*${AMT}\+?`, 'gi'),
  new RegExp(String.raw`${AMT}(?:\+|\s*(?:or more\b|minimum\b|min\.?(?=\s|$)|orders?\b|purchases?\b))`, 'gi'),
  new RegExp(String.raw`${AMT}\s*(?:off\b|back\b|cash ?back\b|credit\b|gift ?card\b|e-?gift\b|in (?:rewards|points|cash|savings)\b|kohl'?s cash\b|rewards?\b|bonus\b)`, 'gi'),
  new RegExp(String.raw`\b(?:save|saving|savings of)\s+(?:up to\s+)?${AMT}`, 'gi'),
]

export function extractPrices(text: string): { price: number | null; original: number | null } {
  const t = text.replace(/\s+/g, ' ')
  const orig = t.match(/(?:reg(?:ularly|\.)?|orig(?:inally|\.)?|was|list(?:ed)?|msrp|retail)\s*:?\s*(?:C\$|CA\$|\$)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/i)
  const scrubbed = NOT_A_PRICE.reduce((s, re) => s.replace(re, ' '), t)
  const all = Array.from(scrubbed.matchAll(MONEY)).map(toNum).filter(n => n > 0 && n < 50000)
  const freeItem = /\bfree\b/i.test(t.replace(/\bfree\s+(?:standard\s+|2-day\s+|next-day\s+)?(?:shipping|s&h|store\s+pickup|in-store\s+pickup|pickup|delivery|returns?|trial|ship)\b/gi, ' '))
  if (all.length === 0) return { price: freeItem ? 0 : null, original: null }
  const price = all.length ? all[0] : null
  let original = orig ? toNum(orig) : null
  if (!original && all.length > 1 && all[1] > (price || 0) * 1.05 && /off|save|reg|was|\(/i.test(t)) original = all[1]
  if (original && price !== null && original <= price) original = null
  return { price, original }
}

export const RETAILERS: Array<{ slug: string; name: string; re: RegExp; country: 'US' | 'CA' | 'BOTH'; search: (q: string) => string }> = [
  { slug: 'amazon-ca', name: 'Amazon.ca', re: /amazon\.ca|amazon canada/i, country: 'CA', search: q => `https://www.amazon.ca/s?k=${encodeURIComponent(q)}` },
  { slug: 'amazon', name: 'Amazon', re: /\bamazon\b|amzn|woot/i, country: 'US', search: q => `https://www.amazon.com/s?k=${encodeURIComponent(q)}` },
  { slug: 'walmart-ca', name: 'Walmart Canada', re: /walmart\.ca|walmart canada/i, country: 'CA', search: q => `https://www.walmart.ca/search?q=${encodeURIComponent(q)}` },
  { slug: 'walmart', name: 'Walmart', re: /walmart/i, country: 'US', search: q => `https://www.walmart.com/search?q=${encodeURIComponent(q)}` },
  { slug: 'bestbuy-ca', name: 'Best Buy Canada', re: /bestbuy\.ca|best buy canada/i, country: 'CA', search: q => `https://www.bestbuy.ca/en-ca/search?search=${encodeURIComponent(q)}` },
  { slug: 'bestbuy', name: 'Best Buy', re: /best ?buy/i, country: 'US', search: q => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}` },
  { slug: 'target', name: 'Target', re: /\btarget\b/i, country: 'US', search: q => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}` },
  { slug: 'costco', name: 'Costco', re: /costco/i, country: 'BOTH', search: q => `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(q)}` },
  { slug: 'homedepot', name: 'The Home Depot', re: /home ?depot/i, country: 'BOTH', search: q => `https://www.homedepot.com/s/${encodeURIComponent(q)}` },
  { slug: 'lowes', name: "Lowe's", re: /lowe'?s/i, country: 'US', search: q => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}` },
  { slug: 'newegg', name: 'Newegg', re: /newegg/i, country: 'BOTH', search: q => `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}` },
  { slug: 'ebay', name: 'eBay', re: /\bebay\b/i, country: 'BOTH', search: q => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}` },
  { slug: 'macys', name: "Macy's", re: /macy'?s/i, country: 'US', search: q => `https://www.macys.com/shop/featured/${encodeURIComponent(q)}` },
  { slug: 'kohls', name: "Kohl's", re: /kohl'?s/i, country: 'US', search: q => `https://www.kohls.com/search.jsp?search=${encodeURIComponent(q)}` },
  { slug: 'nike', name: 'Nike', re: /\bnike\b/i, country: 'BOTH', search: q => `https://www.nike.com/w?q=${encodeURIComponent(q)}` },
  { slug: 'adidas', name: 'adidas', re: /adidas/i, country: 'BOTH', search: q => `https://www.adidas.com/us/search?q=${encodeURIComponent(q)}` },
  { slug: 'dell', name: 'Dell', re: /\bdell\b/i, country: 'BOTH', search: q => `https://www.dell.com/en-us/search/${encodeURIComponent(q)}` },
  { slug: 'lenovo', name: 'Lenovo', re: /lenovo\.com/i, country: 'BOTH', search: q => `https://www.lenovo.com/us/en/search?text=${encodeURIComponent(q)}` },
  { slug: 'samsung', name: 'Samsung', re: /samsung\.com/i, country: 'BOTH', search: q => `https://www.samsung.com/us/search/searchMain/?searchTerm=${encodeURIComponent(q)}` },
  { slug: 'gamestop', name: 'GameStop', re: /gamestop/i, country: 'US', search: q => `https://www.gamestop.com/search/?q=${encodeURIComponent(q)}` },
  { slug: 'staples', name: 'Staples', re: /staples/i, country: 'BOTH', search: q => `https://www.staples.com/${encodeURIComponent(q)}/directory_${encodeURIComponent(q)}` },
  { slug: 'wayfair', name: 'Wayfair', re: /wayfair/i, country: 'BOTH', search: q => `https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(q)}` },
  { slug: 'sams-club', name: "Sam's Club", re: /sam'?s club/i, country: 'US', search: q => `https://www.samsclub.com/s/${encodeURIComponent(q)}` },
  { slug: 'canadiantire', name: 'Canadian Tire', re: /canadian tire/i, country: 'CA', search: q => `https://www.canadiantire.ca/en/search-results.html?q=${encodeURIComponent(q)}` },
  { slug: 'the-source', name: 'The Source', re: /\bthe source\b/i, country: 'CA', search: q => `https://www.thesource.ca/en-ca/search?text=${encodeURIComponent(q)}` },
  { slug: 'sportchek', name: 'Sport Chek', re: /sport ?chek/i, country: 'CA', search: q => `https://www.sportchek.ca/search.html?q=${encodeURIComponent(q)}` },
  { slug: 'shoppers', name: 'Shoppers Drug Mart', re: /shoppers drug mart/i, country: 'CA', search: q => `https://shop.shoppersdrugmart.ca/search?text=${encodeURIComponent(q)}` },
  { slug: 'apple', name: 'Apple', re: /apple store|apple\.com/i, country: 'BOTH', search: q => `https://www.apple.com/us/search/${encodeURIComponent(q)}` },
]

export function findRetailer(...texts: Array<string | null | undefined>) {
  const t = texts.filter(Boolean).join(' ')
  return RETAILERS.find(r => r.re.test(t)) || null
}

/** Same as findRetailer, but swaps to the Canadian storefront when the source is Canadian. */
export function findRetailerFor(country: 'US' | 'CA' | 'BOTH', ...texts: Array<string | null | undefined>) {
  const r = findRetailer(...texts)
  if (!r || country !== 'CA' || r.country === 'CA') return r
  return RETAILERS.find(x => x.slug === `${r.slug}-ca`) || r
}

const CATEGORY_RULES: Array<[string, RegExp]> = [
  ['Gaming', /\b(ps5|ps4|playstation|xbox|nintendo|switch 2|switch oled|steam deck|video game|gaming|gamer|controller|joy-?con|steam key|game pass)\b/i],
  ['Electronics', /\b(tv|oled|qled|laptop|chromebook|macbook|ipad|tablet|monitor|headphones?|earbuds|airpods|speaker|soundbar|ssd|nvme|hard drive|ram|gpu|rtx|radeon|cpu|ryzen|intel core|router|mesh|wi-?fi|camera|gopro|drone|kindle|e-?reader|smartwatch|apple watch|galaxy|pixel|iphone|android|phone|charger|power bank|usb-?c|cable|keyboard|mouse|webcam|projector|echo|alexa|ring|nest|roku|fire tv|streaming)\b/i],
  ['Home & Kitchen', /\b(vacuum|roomba|air fryer|instant pot|blender|kitchen|cookware|skillet|knife|mattress|pillow|sheets|bedding|towel|furniture|sofa|desk lamp|lamp|air purifier|humidifier|dehumidifier|heater|fan|coffee maker|espresso|keurig|nespresso|dishwasher|refrigerator|microwave|toaster|storage|organizer|rug|curtain|smart plug|light bulb)\b/i],
  ['Tools', /\b(drill|driver|saw|dewalt|milwaukee|ryobi|makita|craftsman|wrench|socket|tool set|toolbox|ladder|generator|pressure washer|lawn mower|leaf blower|chainsaw|trimmer)\b/i],
  ['Fashion', /\b(shoes?|sneakers?|boots?|jacket|coat|hoodie|sweater|jeans|pants|shirt|t-shirt|dress|apparel|clothing|socks|underwear|backpack|handbag|wallet|watch band|sunglasses|levi'?s|columbia|north face|under armour|uniqlo)\b/i],
  ['Beauty', /\b(skincare|serum|moisturizer|sunscreen|makeup|mascara|lipstick|perfume|fragrance|cologne|shampoo|conditioner|razor|shaver|trimmer|hair dryer|dyson airwrap|toothbrush|oral-?b|sonicare)\b/i],
  ['Sports', /\b(bike|bicycle|e-?bike|treadmill|rowing|dumbbell|kettlebell|yoga|fitness|gym|camping|tent|sleeping bag|hiking|cooler|yeti|stanley|golf|ski|snowboard|kayak|fishing|scooter)\b/i],
  ['Automotive', /\b(car|tire|tyre|dash ?cam|motor oil|jump starter|wiper|obd|car seat|automotive|vehicle)\b/i],
  ['Grocery', /\b(snack|coffee beans|k-?cups|tea|soda|water|grocery|food|protein|cereal|candy|chocolate|pantry|paper towels|toilet paper|detergent|tide|diapers|wipes)\b/i],
  ['Office', /\b(printer|ink|toner|office chair|standing desk|paper|notebook|pens?|shredder|label maker)\b/i],
  ['Toys', /\b(lego|toy|toys|kids|barbie|hot wheels|nerf|board game|puzzle|plush)\b/i],
]

export function classify(text: string, hint?: string | null): string {
  if (hint) {
    for (const [cat, re] of CATEGORY_RULES) if (re.test(hint)) return cat
  }
  for (const [cat, re] of CATEGORY_RULES) if (re.test(text)) return cat
  return 'Other'
}

export function dealTypeFor(text: string, expiresAt: string | null): 'flash' | 'clearance' | 'daily' {
  if (/clearance|closeout|open[- ]box|refurb|liquidation|final sale/i.test(text)) return 'clearance'
  if (/today only|lightning|ends tonight|flash|24 hours|one day|hours left|doorbuster|price mistake|\bpm\b/i.test(text)) return 'flash'
  if (expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (ms > 0 && ms < 48 * 3600 * 1000) return 'flash'
  }
  return 'daily'
}

/** Turn a deal headline into a clean product query for retailer search. */
export function productQuery(title: string): string {
  return title
    .replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')
    .replace(/(?:C\$|CA\$|\$)\s?\d[\d,]*(?:\.\d{2})?/g, ' ')
    .replace(/\b(for|at|from|w\/|with|via|only|just|now|deal|price|lowest|all-time low|low|new|sale|save|off|shipped|free shipping|\+ free shipping|ymmv|today|prime|members?|coupon|code|reg\.?|was|up to|%|in stock)\b/gi, ' ')
    .replace(/\d+%/g, ' ')
    .replace(/@.*$/, ' ')
    .replace(/\b(at|hits|drops|drops to|falls to|returns|starts|from|on|via)\s+(amazon(\.ca)?|walmart|best buy|target|costco|home depot|lowe'?s|newegg|ebay|woot)\b.*$/i, ' ')
    .replace(/\b(hits|drops|falls|returns|starts|now|is|are|gets|sees|lands|nabs|scores)\b/gi, ' ')
    .replace(/[^\w\s\-&'.,]/g, ' ')
    .replace(/(^|\s),|,(\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s\-.,]+$/, '')
    .trim()
    .split(' ').slice(0, 9).join(' ')
}

export function hash32(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
