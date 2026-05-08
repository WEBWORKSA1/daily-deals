import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  const updates = [
    { match: 'AirPods', image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80' },
    { match: 'Samsung', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&q=80' },
    { match: 'KitchenAid', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
    { match: 'Air Fryer', image_url: 'https://images.unsplash.com/photo-1648195700076-8a53f458db9b?w=400&q=80' },
    { match: 'Nike Air Max', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
    { match: 'Dyson', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    { match: 'Jeans', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
    { match: 'Drill', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80' },
    { match: 'DeWalt', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80' },
    { match: 'Instant Pot', image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
    { match: 'Apple Watch', image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80' },
    { match: 'Jacket', image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400&q=80' },
    { match: 'Coffee', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
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
    { match: 'Running Shoes', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  ]

  const results = []
  for (const u of updates) {
    const { data, error } = await supabase
      .from('deals')
      .update({ image_url: u.image_url })
      .ilike('title', `%${u.match}%`)
      .select('id, title')
    results.push({ match: u.match, updated: data?.length || 0, error: error?.message })
  }

  return NextResponse.json({ success: true, results })
}
