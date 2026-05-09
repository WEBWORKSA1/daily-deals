// Polite scraping primitives shared across all retailer scrapers.
// Every scraper should use fetchHTML() so we get consistent UA, timeouts, retries.

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
]

export async function fetchHTML(url: string, options: { timeoutMs?: number } = {}): Promise<string> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  const res = await fetch(url, {
    headers: {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
    redirect: 'follow',
  })
  if (!res.ok) {
    throw new Error(`Fetch ${url} returned ${res.status}`)
  }
  return res.text()
}

export async function fetchJSON<T = any>(url: string, options: { timeoutMs?: number } = {}): Promise<T> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  const res = await fetch(url, {
    headers: {
      'User-Agent': ua,
      'Accept': 'application/json,text/plain,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
  })
  if (!res.ok) {
    throw new Error(`Fetch ${url} returned ${res.status}`)
  }
  return res.json()
}

// Tiny regex-based HTML parser — we don't need a full DOM library, just match
// patterns from the page source. Each scraper uses these helpers as building
// blocks. If a retailer's page structure changes, we update its scraper file.

export function decodeHtmlEntities(s: string): string {
  if (!s) return ''
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

export function stripTags(s: string): string {
  return s ? decodeHtmlEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : ''
}

export function extractAll(html: string, re: RegExp): RegExpMatchArray[] {
  const out: RegExpMatchArray[] = []
  let m: RegExpExecArray | null
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  while ((m = r.exec(html)) !== null) out.push(m)
  return out
}

export function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null
  const cleaned = String(raw).replace(/[^0-9.,]/g, '').replace(/,(\d{3})/g, '$1').replace(',', '.')
  const m = cleaned.match(/(\d+(?:\.\d{1,2})?)/)
  if (!m) return null
  const n = parseFloat(m[1])
  return isNaN(n) || n <= 0 ? null : n
}

export function dedupByUrl<T extends { product_url: string }>(deals: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const d of deals) {
    const key = d.product_url.split('?')[0].toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(d)
  }
  return out
}

// Extract JSON-LD blocks from HTML. Many retailers embed product schema this way.
export function extractJsonLd(html: string): any[] {
  const results: any[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim())
      if (Array.isArray(parsed)) results.push(...parsed)
      else results.push(parsed)
    } catch {}
  }
  return results
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
