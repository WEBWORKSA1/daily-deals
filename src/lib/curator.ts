// Daily.Deals curator — the LLM judgment layer.
//
// Architecture:
//   1. Pulls pending raw deals from scraped_deals_raw
//   2. Sends each batch to Claude Haiku 4.5 with the editorial rubric
//   3. Promotes passing deals (score >= 70) into the live deals table
//   4. Marks the rest as rejected with reasoning
//
// Cost: ~$0.40 per 1k deals at Haiku pricing. Trivial.

import type { RawDeal, CuratorJudgement } from './scrapers/types'

const MODEL = 'claude-haiku-4-5-20251001'
const PUBLISH_THRESHOLD = 70

const SYSTEM_PROMPT = `You are the editorial curator for Daily.Deals — a premium deal-curation site for US and Canadian shoppers. Your job is to score scraped retailer deals against a strict editorial rubric. Only deals scoring 70+ overall get published. Reject everything else.

For each deal, score across these 5 dimensions:

**DISCOUNT_REALITY (0-30):** Is the markdown believable, or anchor-pricing fraud? A 25% off TV from a credible retailer scores 25-30. A "$999 was $9999" item is anchor-pricing fraud and scores 0-5. Generic "sale price" with no original = 10-15.

**PRODUCT_QUALITY (0-25):** Is this a reputable brand or a generic dropship product? Sony, Apple, Dyson, Nike, KitchenAid, etc. = 22-25. Mid-tier brands = 15-20. No-name Amazon FBA junk = 0-8.

**PRICE_COMPETITIVENESS (0-25):** Is this actually a competitive price, or routine? Use your knowledge of typical product prices. A $299 PS5 controller (down from $199 typical) is bad. A $899 MacBook Air M3 is excellent. If unsure, score 12-15.

**URGENCY_LEGITIMACY (0-10):** Real time-limited deal, or perpetual "24-hour sale" theater? Lightning Deal / Deal of the Day with real expiration = 8-10. Vague "limited time" = 4-6. No urgency claims = 6-8 (neutral).

**USER_VALUE (0-10):** Would you tell a friend? Genuinely useful product at a real discount = 8-10. Marginal = 4-6. Not worth telling anyone = 0-3.

Return ONLY valid JSON, no prose, in this exact shape:
{
  "score": <total 0-100>,
  "publish": <boolean: true if score >= 70>,
  "reasoning": "<one sentence why>",
  "scores": {
    "discount_reality": <0-30>,
    "product_quality": <0-25>,
    "price_competitiveness": <0-25>,
    "urgency_legitimacy": <0-10>,
    "user_value": <0-10>
  },
  "suggested_category": "<Electronics|Fashion|Home|Sports|Beauty|Gaming|Tools|Toys|Grocery|Books|Pet|Office|Other>",
  "red_flags": ["<flag1>", "<flag2>"]
}

Be strict. Most scraped deals are routine, not editorial-worthy. The bar is: would Wirecutter or The Strategist publish this?`

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

async function callClaude(messages: ClaudeMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Claude API ${res.status}: ${errorText}`)
  }

  const data = await res.json() as any
  const textBlock = data.content?.find((b: any) => b.type === 'text')
  if (!textBlock?.text) throw new Error('Claude returned no text content')
  return textBlock.text
}

function extractJson(text: string): any | null {
  // Try direct parse
  try { return JSON.parse(text.trim()) } catch {}
  // Try to find { ... } block
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

function summarizeForCurator(d: RawDeal): string {
  return [
    `Retailer: ${d.retailer_name} (${d.country})`,
    `Title: ${d.title}`,
    d.description ? `Description: ${d.description}` : null,
    `Deal price: $${d.deal_price}`,
    d.original_price ? `Original price: $${d.original_price}` : null,
    d.discount_percent !== null && d.discount_percent !== undefined ? `Discount: ${d.discount_percent}%` : null,
    d.coupon_code ? `Coupon: ${d.coupon_code}` : null,
    `Deal type: ${d.deal_type}`,
    d.expires_at ? `Expires: ${d.expires_at}` : null,
  ].filter(Boolean).join('\n')
}

export async function judgeDeal(d: RawDeal): Promise<CuratorJudgement> {
  const userMessage = `Score this scraped deal against the rubric:\n\n${summarizeForCurator(d)}\n\nReturn JSON only.`

  let raw: string
  try {
    raw = await callClaude([{ role: 'user', content: userMessage }])
  } catch (e: any) {
    return {
      score: 0,
      publish: false,
      reasoning: `Curator API error: ${e.message}`,
      scores: { discount_reality: 0, product_quality: 0, price_competitiveness: 0, urgency_legitimacy: 0, user_value: 0 },
    }
  }

  const parsed = extractJson(raw)
  if (!parsed) {
    return {
      score: 0,
      publish: false,
      reasoning: 'Curator returned invalid JSON',
      scores: { discount_reality: 0, product_quality: 0, price_competitiveness: 0, urgency_legitimacy: 0, user_value: 0 },
    }
  }

  const score = Number(parsed.score) || 0
  return {
    score,
    publish: score >= PUBLISH_THRESHOLD,
    reasoning: String(parsed.reasoning || '').slice(0, 500),
    scores: {
      discount_reality:     Number(parsed.scores?.discount_reality) || 0,
      product_quality:      Number(parsed.scores?.product_quality) || 0,
      price_competitiveness: Number(parsed.scores?.price_competitiveness) || 0,
      urgency_legitimacy:   Number(parsed.scores?.urgency_legitimacy) || 0,
      user_value:           Number(parsed.scores?.user_value) || 0,
    },
    suggested_category: parsed.suggested_category || undefined,
    red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : undefined,
  }
}
