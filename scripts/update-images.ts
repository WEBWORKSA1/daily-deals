import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vaxhdxgrdukqylrelwjk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheGhkeGdyZHVrcXlscmVsd2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTkyNzIsImV4cCI6MjA5Mzc3NTI3Mn0.6PHlixbcrXuBdTgOY36Zl6q7fiK7f7vrBNq75DndUIc'
)

const images = [
  { title: 'Apple AirPods Pro 2nd Gen', image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80' },
  { title: 'Samsung 65 4K QLED TV', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&q=80' },
  { title: 'KitchenAid Stand Mixer 5qt', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
  { title: 'Ninja Air Fryer XL 5.5qt', image_url: 'https://images.unsplash.com/photo-1648195700076-8a53f458db9b?w=400&q=80' },
  { title: 'Nike Air Max 270 Sneakers', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { title: 'Dyson V15 Detect Cordless Vacuum', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { title: "Levi 501 Original Jeans", image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { title: 'DeWalt 20V Cordless Drill Kit', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80' },
  { title: 'Instant Pot Duo 7-in-1 6qt', image_url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
  { title: 'Apple Watch Series 9 GPS 41mm', image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80' },
  { title: 'Columbia Mens Winter Jacket', image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400&q=80' },
  { title: 'Cuisinart 12-Cup Coffee Maker', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
  { title: 'LG 27 4K UHD Monitor', image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80' },
  { title: 'Adidas Ultraboost 22 Running Shoes', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80' },
  { title: 'iRobot Roomba i3 Robot Vacuum', image_url: 'https://images.unsplash.com/photo-1589006142750-a0d6f8839a27?w=400&q=80' },
  { title: 'Apple AirPods Pro 2nd Gen CA', image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80' },
  { title: 'Samsung 65 4K TV Canada', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&q=80' },
  { title: 'Canadian Tire 6-Piece BBQ Set', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { title: 'Nike Air Max 270 CA', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { title: 'Dyson V12 Detect Slim', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { title: 'The Bay Calvin Klein Jacket', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80' },
  { title: 'Sport Chek Under Armour Hoodie', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80' },
  { title: 'Staples Canada Office Chair', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  { title: 'Home Depot Canada Dewalt Combo Kit', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80' },
  { title: 'Apple Watch SE 2nd Gen CA', image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80' },
  { title: 'Winners Hunter Rain Boots', image_url: 'https://images.unsplash.com/photo-1608256246200-2e3e7943b027?w=400&q=80' },
  { title: 'Amazon Echo Dot 5th Gen CA', image_url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&q=80' },
  { title: 'Canadian Tire Mastercraft Tool Box', image_url: 'https://images.unsplash.com/photo-1581147036324-c17ac41c3321?w=400&q=80' },
  { title: 'Sport Chek Nike Running Shoes', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { title: 'Loblaws PC Insiders Collection Box', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' },
]

async function updateImages() {
  for (const item of images) {
    const { error } = await supabase
      .from('deals')
      .update({ image_url: item.image_url })
      .eq('title', item.title)
    if (error) console.error(`Failed: ${item.title}`, error.message)
    else console.log(`✅ Updated: ${item.title}`)
  }
  console.log('Done!')
}

updateImages()
