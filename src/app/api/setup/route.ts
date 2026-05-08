import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  // 1. Add beauty deals
  const beautyDeals = [
    { title: 'Dyson Airwrap Multi-Styler', description: 'Styles, waves, curls and dries with no extreme heat. Includes 6 attachments.', original_price: 599.00, deal_price: 399.00, discount_percent: 33, retailer_id: 1, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80', affiliate_url: 'https://amazon.com/dyson-airwrap?tag=dailydeals-us-20', is_online: true, is_national: true, country: 'US', deal_type: 'flash', is_featured: true, is_active: true },
    { title: 'Charlotte Tilbury Pillow Talk Lipstick', description: 'Iconic nude-pink matte lipstick. Long lasting, comfortable wear.', original_price: 38.00, deal_price: 24.00, discount_percent: 37, retailer_id: 3, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2080?w=400&q=80', affiliate_url: 'https://target.com/charlotte-tilbury-lipstick', is_online: true, is_national: true, country: 'US', deal_type: 'daily', is_featured: false, is_active: true },
    { title: 'NARS Orgasm Blush', description: 'Universally flattering peach-gold with golden shimmer. Best-seller.', original_price: 34.00, deal_price: 22.00, discount_percent: 35, retailer_id: 3, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', affiliate_url: 'https://target.com/nars-orgasm-blush', is_online: true, is_national: true, country: 'US', deal_type: 'clearance', is_featured: false, is_active: true },
    { title: 'Olaplex No. 3 Hair Perfector', description: 'Reduces breakage and visibly strengthens hair. Salon quality at home.', original_price: 30.00, deal_price: 18.00, discount_percent: 40, retailer_id: 2, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1527799820374-87642af6e358?w=400&q=80', affiliate_url: 'https://walmart.com/olaplex-no3', is_online: true, is_national: true, country: 'US', deal_type: 'daily', is_featured: false, is_active: true },
    { title: 'Tatcha The Dewy Skin Cream', description: 'Japanese-inspired moisturizer with hadasei-3 complex. Plumps and hydrates.', original_price: 72.00, deal_price: 45.00, discount_percent: 38, retailer_id: 1, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&q=80', affiliate_url: 'https://amazon.com/tatcha-dewy-skin?tag=dailydeals-us-20', is_online: true, is_national: true, country: 'US', deal_type: 'daily', is_featured: false, is_active: true },
    { title: 'Urban Decay Naked Palette', description: 'Iconic 12-shade eyeshadow palette. Neutrals to smoky. Limited stock.', original_price: 54.00, deal_price: 32.00, discount_percent: 41, retailer_id: 3, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80', affiliate_url: 'https://target.com/urban-decay-naked', is_online: true, is_national: true, country: 'US', deal_type: 'clearance', is_featured: false, is_active: true },
    { title: 'Dyson Airwrap CA', description: 'Styles, waves, curls and dries with no extreme heat. Canadian edition.', original_price: 749.00, deal_price: 499.00, discount_percent: 33, retailer_id: 11, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80', affiliate_url: 'https://amazon.ca/dyson-airwrap?tag=dailydeals-ca-20', is_online: true, is_national: true, country: 'CA', deal_type: 'flash', is_featured: true, is_active: true },
    { title: 'The Ordinary Niacinamide Serum', description: 'Reduces pore appearance and blemishes. 10% niacinamide + 1% zinc.', original_price: 12.00, deal_price: 7.00, discount_percent: 42, retailer_id: 11, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80', affiliate_url: 'https://amazon.ca/ordinary-niacinamide?tag=dailydeals-ca-20', is_online: true, is_national: true, country: 'CA', deal_type: 'daily', is_featured: false, is_active: true },
    { title: 'Fenty Beauty Pro Filtr Foundation', description: 'Full coverage, long-wearing foundation. 50 shades for all skin tones.', original_price: 46.00, deal_price: 29.00, discount_percent: 37, retailer_id: 11, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1631214524020-3c69888e6d9f?w=400&q=80', affiliate_url: 'https://amazon.ca/fenty-pro-filtr?tag=dailydeals-ca-20', is_online: true, is_national: true, country: 'CA', deal_type: 'daily', is_featured: false, is_active: true },
    { title: 'CeraVe Moisturizing Cream', description: 'Developed with dermatologists. Restores skin barrier with ceramides.', original_price: 22.00, deal_price: 13.00, discount_percent: 41, retailer_id: 12, category: 'Beauty', image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80', affiliate_url: 'https://walmart.ca/cerave-cream', is_online: true, is_national: true, country: 'CA', deal_type: 'daily', is_featured: false, is_active: true },
  ]

  const { error: beautyError } = await supabase.from('deals').insert(beautyDeals)

  // 2. Update product images for existing deals
  const imageUpdates = [
    { match: 'AirPods', image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80' },
    { match: 'Samsung', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&q=80' },
    { match: 'KitchenAid', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
    { match: 'Air Fryer', image_url: 'https://images.unsplash.com/photo-1648195700076-8a53f458db9b?w=400&q=80' },
    { match: 'Nike Air Max', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
    { match: 'Dyson V', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    { match: 'Jeans', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
    { match: 'DeWalt', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80' },
    { match: 'Instant Pot', image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
    { match: 'Apple Watch', image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80' },
    { match: 'Columbia', image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400&q=80' },
    { match: 'Coffee Maker', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
    { match: 'Monitor', image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80' },
    { match: 'Ultraboost', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80' },
    { match: 'Roomba', image_url: 'https://images.unsplash.com/photo-1589006142750-a0d6f8839a27?w=400&q=80' },
    { match: 'BBQ', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
    { match: 'Calvin Klein', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80' },
    { match: 'Hoodie', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80' },
    { match: 'Office Chair', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
    { match: 'Echo Dot', image_url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&q=80' },
    { match: 'Tool Box', image_url: 'https://images.unsplash.com/photo-1581147036324-c17ac41c3321?w=400&q=80' },
    { match: 'Boot', image_url: 'https://images.unsplash.com/photo-1608256246200-2e3e7943b027?w=400&q=80' },
    { match: 'Loblaws', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' },
    { match: 'Pegasus', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
    { match: 'Jacket', image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400&q=80' },
  ]

  const imageResults = []
  for (const u of imageUpdates) {
    const { data, error } = await supabase
      .from('deals')
      .update({ image_url: u.image_url })
      .ilike('title', `%${u.match}%`)
      .is('image_url', null)
      .select('id')
    imageResults.push({ match: u.match, updated: data?.length || 0 })
  }

  return NextResponse.json({
    beauty_deals_added: beautyError ? 0 : beautyDeals.length,
    beauty_error: beautyError?.message || null,
    images_updated: imageResults,
  })
}
