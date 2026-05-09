// /api/curator/run
//
// Pulls all pending rows from scraped_deals_raw, sends each to Claude Haiku
// for editorial judgment, and promotes passing deals (score >= 70) into the
// live deals table. Marks the rest as rejected with reasoning.

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { judgeDeal } from '@/lib/curator'
import type { RawDeal } from '@/lib/scrapers/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('x-cron-secret') === secret
    || req.nextUrl.searchParams.get('secret') === secret
}

async function findOrCreateRetailer(slug: string, name: string, country: string): Promise<number | null> {
  // Look for existing retailer by slug
  const { data: existing } = await supabase
    .from('retailers')
    .select('id')
    .eq('slug', slug)
    .single()
  if (existing) return (existing as any).id

  // Create if missing
  const { data: created, error } = await supabase
    .from('retailers')
    .insert({
      slug,
      name,
      country,
      affiliate_net: slug.startsWith('amazon-') ? 'amazon' : 'direct',
      commission_rate: 5.00,
      cashback_rate: 1.50,
    })
    .select('id')
    .single()
  if (error || !created) return null
  return (created as any).id
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const startedAt = Date.now()
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100', 10)

  // Pull pending raw deals (oldest first)
  const { data: pending, error: fetchErr } = await supabase
    .from('scraped_deals_raw')
    .select('*')
    .eq('status', 'pending')
    .order('scraped_at', { ascending: true })
    .limit(limit)

  if (fetchErr) {
    return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 })
  }
  if (!pending || pending.length === 0) {
    return NextResponse.json({ ok: true, message: 'no pending deals', judged: 0, published: 0, rejected: 0 })
  }

  let published = 0
  let rejected = 0
  let errors = 0
  const samples: any[] = []

  // Process serially (rate limit — Haiku handles 50 RPM easily but we don't need bursts)
  for (const row of pending) {
    const raw: RawDeal = {
      retailer_slug: (row as any).retailer_slug,
      retailer_name: (row as any).retailer_name,
      country: (row as any).country,
      source_url: (row as any).source_url,
      product_url: (row as any).product_url,
      title: (row as any).title,
      description: (row as any).description,
      image_url: (row as any).image_url,
      category: (row as any).category,
      deal_price: parseFloat((row as any).deal_price),
      original_price: (row as any).original_price ? parseFloat((row as any).original_price) : null,
      discount_percent: (row as any).discount_percent,
      coupon_code: (row as any).coupon_code,
      expires_at: (row as any).expires_at,
      deal_type: (row as any).deal_type,
    }

    try {
      const judgement = await judgeDeal(raw)

      if (judgement.publish) {
        // Find or create retailer
        const retailerId = await findOrCreateRetailer(raw.retailer_slug, raw.retailer_name, raw.country)
        if (!retailerId) {
          await supabase.from('scraped_deals_raw').update({
            status: 'error',
            curator_score: judgement.score,
            curator_reasoning: 'Failed to find/create retailer',
            judged_at: new Date().toISOString(),
          }).eq('id', (row as any).id)
          errors++
          continue
        }

        const expires = raw.expires_at
          ? new Date(raw.expires_at)
          : new Date(Date.now() + 24 * 3600 * 1000) // Default: 24h from now

        const { data: dealRow, error: insErr } = await supabase
          .from('deals')
          .insert({
            title: raw.title.slice(0, 200),
            description: raw.description?.slice(0, 2000) || null,
            deal_price: raw.deal_price,
            original_price: raw.original_price,
            discount_percent: raw.discount_percent,
            retailer_id: retailerId,
            category: judgement.suggested_category || raw.category || 'Other',
            image_url: raw.image_url,
            affiliate_url: raw.product_url,
            country: raw.country,
            deal_type: raw.deal_type,
            is_active: true,
            is_featured: false,
            is_national: true,
            is_online: true,
            is_online_only: true,
            is_verified: true,
            click_count: 0,
            hotness_score: judgement.score,
            expires_at: expires.toISOString(),
          })
          .select('id')
          .single()

        if (insErr || !dealRow) {
          errors++
          await supabase.from('scraped_deals_raw').update({
            status: 'error',
            curator_score: judgement.score,
            curator_reasoning: insErr?.message || 'insert failed',
            judged_at: new Date().toISOString(),
          }).eq('id', (row as any).id)
          continue
        }

        await supabase.from('scraped_deals_raw').update({
          status: 'published',
          published_deal_id: (dealRow as any).id,
          curator_score: judgement.score,
          curator_reasoning: judgement.reasoning,
          judged_at: new Date().toISOString(),
        }).eq('id', (row as any).id)

        published++
        if (samples.length < 5) samples.push({ status: 'published', title: raw.title, score: judgement.score })
      } else {
        await supabase.from('scraped_deals_raw').update({
          status: 'rejected',
          curator_score: judgement.score,
          curator_reasoning: judgement.reasoning,
          judged_at: new Date().toISOString(),
        }).eq('id', (row as any).id)
        rejected++
        if (samples.length < 5) samples.push({ status: 'rejected', title: raw.title, score: judgement.score, reasoning: judgement.reasoning })
      }
    } catch (e: any) {
      errors++
      await supabase.from('scraped_deals_raw').update({
        status: 'error',
        curator_reasoning: `Curator threw: ${e?.message || String(e)}`,
        judged_at: new Date().toISOString(),
      }).eq('id', (row as any).id)
    }
  }

  return NextResponse.json({
    ok: true,
    duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    judged: pending.length,
    published,
    rejected,
    errors,
    samples,
  })
}

export async function GET(req: NextRequest) { return POST(req) }
