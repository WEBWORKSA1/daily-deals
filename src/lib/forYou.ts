// Personalization engine — builds a "For You" feed from a user's behavior
// Inputs: user's vote history, saved deals, click history, declared category prefs
// Output: ranked list of deals scored by relevance to that user

import { supabase } from './db'
import { computeHotness } from './hotness'

interface UserSignals {
  upvotedCategories: Map<string, number>
  upvotedRetailers: Map<string, number>
  savedCategories: Map<string, number>
  savedRetailers: Map<string, number>
  preferredCountry: string
}

export async function buildForYouFeed(userId: number, limit: number = 24) {
  const signals = await collectSignals(userId)

  // Get all candidate deals (active + recent)
  const { data: candidates } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, brand_color, affiliate_net, country)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(200)

  if (!candidates || candidates.length === 0) return []

  // Score each candidate against user signals
  const scored = candidates.map((d: any) => {
    const baseHotness = computeHotness(d)
    let personalScore = baseHotness

    // Category match bonus (up to +30)
    const catWeight = signals.upvotedCategories.get(d.category) || 0
    const savedCatWeight = signals.savedCategories.get(d.category) || 0
    personalScore += Math.min(20, catWeight * 4) + Math.min(10, savedCatWeight * 5)

    // Retailer match bonus (up to +20)
    const retSlug = d.retailers?.slug
    if (retSlug) {
      const retWeight = signals.upvotedRetailers.get(retSlug) || 0
      const savedRetWeight = signals.savedRetailers.get(retSlug) || 0
      personalScore += Math.min(15, retWeight * 5) + Math.min(5, savedRetWeight * 3)
    }

    // Country match bonus (+10 if preferred country)
    if (d.country === signals.preferredCountry || d.country === 'BOTH') {
      personalScore += 10
    }

    // Cap at 200 (allows separation from purely-hot deals)
    personalScore = Math.min(200, personalScore)

    return {
      ...d,
      retailer_name: d.retailers?.name,
      retailer_slug: d.retailers?.slug,
      retailer_brand_color: d.retailers?.brand_color,
      affiliate_net: d.retailers?.affiliate_net,
      personal_score: Math.round(personalScore),
    }
  })

  // Sort by personal score desc
  scored.sort((a: any, b: any) => b.personal_score - a.personal_score)

  return scored.slice(0, limit)
}

async function collectSignals(userId: number): Promise<UserSignals> {
  const upvotedCategories = new Map<string, number>()
  const upvotedRetailers = new Map<string, number>()
  const savedCategories = new Map<string, number>()
  const savedRetailers = new Map<string, number>()

  try {
    // Upvotes
    const { data: upvotes } = await supabase
      .from('user_votes')
      .select('deal_id, vote, deals(category, retailers(slug))')
      .eq('user_id', userId)
      .eq('vote', 1)
      .limit(100)

    for (const v of (upvotes || []) as any[]) {
      const cat = v.deals?.category
      const retailerSlug = v.deals?.retailers?.slug
      if (cat) upvotedCategories.set(cat, (upvotedCategories.get(cat) || 0) + 1)
      if (retailerSlug) upvotedRetailers.set(retailerSlug, (upvotedRetailers.get(retailerSlug) || 0) + 1)
    }

    // Saves
    const { data: saves } = await supabase
      .from('user_saved_deals')
      .select('deal_id, deals(category, retailers(slug))')
      .eq('user_id', userId)
      .limit(100)

    for (const s of (saves || []) as any[]) {
      const cat = s.deals?.category
      const retailerSlug = s.deals?.retailers?.slug
      if (cat) savedCategories.set(cat, (savedCategories.get(cat) || 0) + 1)
      if (retailerSlug) savedRetailers.set(retailerSlug, (savedRetailers.get(retailerSlug) || 0) + 1)
    }
  } catch {}

  // Country preference
  let preferredCountry = 'US'
  try {
    const { data: u } = await supabase
      .from('users')
      .select('country')
      .eq('id', userId)
      .single()
    if (u && (u as any).country) preferredCountry = (u as any).country
  } catch {}

  return {
    upvotedCategories,
    upvotedRetailers,
    savedCategories,
    savedRetailers,
    preferredCountry,
  }
}

// Insights about what the user likes (for explanation in UI)
export async function getUserInsights(userId: number) {
  const signals = await collectSignals(userId)

  const topCategories = Array.from(signals.upvotedCategories.entries())
    .concat(Array.from(signals.savedCategories.entries()))
    .reduce((acc, [k, v]) => acc.set(k, (acc.get(k) || 0) + v), new Map<string, number>())

  const topRetailers = Array.from(signals.upvotedRetailers.entries())
    .concat(Array.from(signals.savedRetailers.entries()))
    .reduce((acc, [k, v]) => acc.set(k, (acc.get(k) || 0) + v), new Map<string, number>())

  return {
    favoriteCategories: Array.from(topCategories.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
    favoriteRetailers: Array.from(topRetailers.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
    totalSignals: signals.upvotedCategories.size + signals.savedCategories.size,
  }
}
