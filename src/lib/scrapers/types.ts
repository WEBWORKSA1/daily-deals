// Shared types for the scraper engine.
// Every scraper returns RawDeal[]. The curator scores each, then promotes
// passing rows into the live `deals` table.

export interface RawDeal {
  retailer_slug: string                  // e.g. 'amazon-us', 'walmart-ca'
  retailer_name: string                  // 'Amazon', 'Walmart Canada'
  country: 'US' | 'CA'
  source_url: string                     // The URL we scraped this from
  product_url: string                    // Direct deep link to the product
  title: string
  description?: string | null
  image_url?: string | null
  category?: string | null
  deal_price: number
  original_price?: number | null
  discount_percent?: number | null
  coupon_code?: string | null
  expires_at?: string | null             // ISO timestamp
  deal_type: 'daily' | 'flash' | 'clearance' | 'lightning' | 'rollback' | 'special-buy'
  raw?: any                              // Anything the scraper wants to preserve
}

export interface ScrapeResult {
  retailer: string
  ok: boolean
  count: number
  deals: RawDeal[]
  error?: string
  duration_ms: number
}

export interface CuratorJudgement {
  score: number                          // 0-100
  publish: boolean                       // score >= 70
  reasoning: string                      // 1-2 sentence explanation
  scores: {
    discount_reality: number             // 0-30
    product_quality: number              // 0-25
    price_competitiveness: number        // 0-25
    urgency_legitimacy: number           // 0-10
    user_value: number                   // 0-10
  }
  suggested_category?: string
  red_flags?: string[]
}
