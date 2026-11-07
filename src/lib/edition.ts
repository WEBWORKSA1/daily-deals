// The Daily Edition — an automatically written front page for each day.
// Built from the merged deal pool. If ANTHROPIC_API_KEY is set, Claude writes the
// morning note (cached once per day); otherwise a deterministic editorial template is used.

import { unstable_cache } from 'next/cache'
import type { Deal } from '@/types'
import { getDeals } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

export interface EditionItem { deal: Deal; blurb: string }
export interface Edition { dateKey: string; dateLabel: string; intro: string; top: EditionItem[]; byCategory: Array<{ category: string; items: EditionItem[] }>; total: number }

const TIPS: Record<string, string> = {
  Electronics: 'Match the exact model number before you buy — event-season variants can differ.',
  Gaming: 'Digital codes deliver instantly; check the store region before you check out.',
  'Home & Kitchen': 'Check the return window on larger appliances; some carry restocking fees.',
  Fashion: 'Sizing varies by brand — scan the size chart and the return policy first.',
  Tools: 'Battery platform matters: stick with the system you already own to save on chargers.',
  Beauty: 'Compare the price per millilitre — mini sizes rarely beat full size on value.',
  Sports: 'Confirm the size and weight limits on fitness gear before you buy.',
  Grocery: 'Use the unit price to compare pack sizes — bigger is not always cheaper.',
  Office: 'Check ink or refill costs; the cheapest printer is not always the cheapest to run.',
  Automotive: 'Verify fitment for your vehicle year and model before ordering.',
  Toys: 'Holiday toy prices swing weekly — this is a solid moment if it is on your list.',
  Other: 'Confirm shipping and return terms at checkout.',
}

function pct(d: Deal) {
  return d.discount_percent || (d.original_price ? Math.round(((d.original_price - d.deal_price) / d.original_price) * 100) : 0)
}

export function blurbFor(d: Deal): string {
  const p = pct(d)
  const price = formatPrice(d.deal_price, d.country)
  const was = d.original_price ? ` (was ${formatPrice(d.original_price, d.country)})` : ''
  const lead = p >= 40 ? `A deep cut: ${p}% off` : p >= 20 ? `A solid ${p}% off` : p > 0 ? `${p}% off` : 'A notable price'
  const where = d.retailer_name ? ` at ${d.retailer_name}` : ''
  const tip = TIPS[d.category] || TIPS.Other
  return `${lead}${where} — now ${price}${was}. ${tip}`
}

function templateIntro(dateLabel: string, top: EditionItem[], total: number): string {
  if (!total) return 'Good morning. Our deal desk is refreshing its sources for today’s edition — check back shortly, or tell our Deal Concierge what you are shopping for and we will email you when the price is right.'
  const lead = top[0]?.deal
  const cats = Array.from(new Set(top.map(t => t.deal.category).filter(c => c && c !== 'Other'))).slice(0, 3)
  return `Good morning. Today’s edition scans ${total} live offers and keeps the ones that clear our bar.` +
    (lead ? ` Leading the page: ${lead.title.replace(/\s+—.*$/, '').replace(/\s+(?:at|@|from)\s+[\w.' &-]+$/i, '').replace(/\s+for\s+(?:C\$|\$)[\d,.]+.*$/i, '')}${lead.retailer_name ? ` at ${lead.retailer_name}` : ''}.` : '') +
    (cats.length ? ` The strongest value is in ${cats.join(', ').replace(/, ([^,]*)$/, ' and $1')}.` : '') +
    ' Prices move all day, so confirm the total at checkout — and if what you want is not here, tell our Deal Concierge and we will watch it for you.'
}

async function claudeIntro(dateLabel: string, top: EditionItem[]): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || !top.length) return null
  try {
    const list = top.slice(0, 8).map(t => `- ${t.deal.title} | ${t.deal.retailer_name} | ${formatPrice(t.deal.deal_price, t.deal.country)} | ${pct(t.deal)}% off | ${t.deal.category}`).join('\n')
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.EDITION_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 300,
        system: 'You write the 3-sentence morning note for Daily.Deals, a calm, editorial deal publication (Wirecutter tone). No emojis, no hype words like "hot" or "insane", no exclamation marks. Mention one or two specific standouts. Plain text only.',
        messages: [{ role: 'user', content: `Edition for ${dateLabel}. Top picks:\n${list}\n\nWrite the note.` }],
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const j: any = await res.json()
    const text = j?.content?.find((b: any) => b.type === 'text')?.text?.trim()
    return text && text.length > 40 ? text.slice(0, 900) : null
  } catch { return null }
}

async function buildEdition(dateKey: string): Promise<Edition> {
  const deals = await getDeals({ feed: 'hot', limit: 80 })
  const dateLabel = new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const top = deals.slice(0, 10).map(deal => ({ deal, blurb: blurbFor(deal) }))
  const used = new Set(top.map(t => t.deal.id))
  const groups = new Map<string, EditionItem[]>()
  for (const d of deals) {
    if (used.has(d.id) || !d.category || d.category === 'Other') continue
    const g = groups.get(d.category) || []
    if (g.length < 4) { g.push({ deal: d, blurb: blurbFor(d) }); groups.set(d.category, g) }
  }
  const byCategory = Array.from(groups.entries()).filter(([, v]) => v.length >= 2).map(([category, items]) => ({ category, items })).slice(0, 6)
  const intro = (await claudeIntro(dateLabel, top)) || templateIntro(dateLabel, top, deals.length)
  return { dateKey, dateLabel, intro, top, byCategory, total: deals.length }
}

export function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }) // YYYY-MM-DD
}

export async function getEdition(): Promise<Edition> {
  const key = todayKey()
  return unstable_cache(() => buildEdition(key), ['daily-edition-v1', key], { revalidate: 3600, tags: ['live-deals'] })()
}
