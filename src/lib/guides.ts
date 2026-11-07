// Original, evergreen editorial library. Written for Daily.Deals — not syndicated.
// Body lines starting with "- " render as bullet lists; everything else as paragraphs.

export interface Guide {
  slug: string
  title: string
  dek: string
  topic: 'Smart Shopping' | 'Sales Calendar' | 'Buying Guides' | 'Canada' | 'Safety'
  updated: string
  minutes: number
  related?: Array<[string, string]>
  sections: Array<{ h: string; body: string[] }>
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-tell-if-a-deal-is-real',
    title: 'How to Tell If a Deal Is Actually a Deal',
    dek: 'A five-minute checklist for separating real markdowns from inflated “was” prices, fake urgency and bundles that cost more than they save.',
    topic: 'Smart Shopping', updated: '2026-11-01', minutes: 6,
    related: [['Daily Hot deals', '/deals/hot'], ['Set a price alert', '/concierge#alerts']],
    sections: [
      { h: 'Start with the price, not the percentage', body: [
        'A “60% off” badge is only as honest as the number it is measured against. Retailers are free to choose the comparison price, and some pick a list price the item rarely sold for. The question that matters is simple: is today’s price lower than what this exact product has usually cost over the last few months?',
        'Price-history tools and browser extensions answer that in seconds. If the current price matches the lowest point on a 90-day chart, it is a genuine low. If the chart shows the item sat at the “sale” price for most of the year, the discount is decoration.',
      ]},
      { h: 'The five-point check', body: [
        '- Compare the exact model number, not the product name. Big events often feature special editions with slightly different parts or bundles.',
        '- Check at least two other major retailers. A real deal is usually matched or beaten nowhere else at that moment.',
        '- Add shipping, tax, membership fees and return costs. A low sticker price with a paid return policy can be the more expensive option.',
        '- Read the newest reviews, not the average. Quality changes between production runs, and recent reviews catch it first.',
        '- Ask whether you would buy it at full price within the next six months. If not, the discount is not saving you money.',
      ]},
      { h: 'Watch for manufactured urgency', body: [
        'Countdown timers, “only 3 left” banners and limited-time pop-ups are designed to stop you from comparing. Some are real — lightning-style deals do sell out — but many reset daily. If a timer shows up again tomorrow at the same price, it was never limited.',
        'A practical rule: if a deal requires you to decide in under ten minutes and you have not been tracking that product, let it go. Another one will come along, and you will be better prepared for it.',
      ]},
      { h: 'Unit price beats sticker price', body: [
        'For anything consumable — groceries, detergent, batteries, coffee pods — divide by the count, weight or volume. Bulk packs and “value” sizes are not always cheaper per unit, and smaller packs on promotion frequently beat the warehouse size.',
      ]},
      { h: 'How Daily.Deals scores a deal', body: [
        'Every deal we publish is ranked by a hotness score that weighs the size of the discount, how recently it was found, whether the comparison price is plausible, and how many shoppers engage with it. Curated deals also pass an editorial rubric that rejects anchor pricing and no-name products. No score is perfect, which is why every deal page links to the retailer so you can confirm the final price before you buy.',
      ]},
    ],
  },
  {
    slug: 'black-friday-cyber-monday-playbook',
    title: 'The Black Friday & Cyber Monday Playbook',
    dek: 'A practical game plan for the biggest shopping week of the year — what to prepare, when to buy, and which categories usually deliver the deepest cuts.',
    topic: 'Sales Calendar', updated: '2026-11-03', minutes: 7,
    related: [['Daily Flash deals', '/deals/flash'], ['Best time to buy calendar', '/guides/best-time-to-buy-calendar']],
    sections: [
      { h: 'Two weeks out: build a short list', body: [
        'The shoppers who save the most during Black Friday decided what they wanted in early November. Write down the three to five things you would buy anyway, note the exact model numbers, and record today’s price for each. That baseline is what turns a flood of banners into a quick yes-or-no decision.',
        '- Create or update accounts at the retailers you use most, and save a payment method so checkout takes seconds.',
        '- Sign up for free loyalty programs; some early-access offers are reserved for members.',
        '- Set price alerts for your short list so you are notified the moment prices drop.',
      ]},
      { h: 'The week of: expect “early” deals to be real', body: [
        'Black Friday is no longer a single day. Many retailers now launch their best prices in the week before, and a large share of the event-level discounts appear early and simply continue through the weekend. If an item on your list hits a price at or below its yearly low, buying early is usually safe — and most major retailers offer extended holiday return windows.',
      ]},
      { h: 'Categories that usually deliver', body: [
        '- Televisions, especially last year’s models and mid-range sets from major brands.',
        '- Headphones, earbuds and smart speakers.',
        '- Smart-home devices, streaming sticks and e-readers.',
        '- Small kitchen appliances such as air fryers, blenders and coffee makers.',
        '- Video games, gift cards bundled with consoles, and PC components.',
      ]},
      { h: 'Categories to be careful with', body: [
        'Doorbuster televisions are sometimes special models built for the event with cheaper components. Compare the model number to the retailer’s regular lineup. Furniture, mattresses and large appliances are discounted at Black Friday, but comparable prices often return around long weekends throughout the year, so there is less pressure to buy now.',
      ]},
      { h: 'Cyber Monday and after', body: [
        'Cyber Monday tends to favour online-only retailers, software, subscriptions and fashion. After the weekend, watch for price adjustments: some retailers will refund the difference if an item you bought drops further within their policy window. Keep receipts and order numbers organized in one email folder so claims take minutes.',
      ]},
    ],
  },
  {
    slug: 'best-time-to-buy-calendar',
    title: 'The Best Time to Buy Almost Anything: A Month-by-Month Calendar',
    dek: 'Retail runs on a predictable rhythm. Learn the seasonal patterns and you can plan big purchases around the months when prices usually soften.',
    topic: 'Sales Calendar', updated: '2026-10-28', minutes: 8,
    related: [['Black Friday playbook', '/guides/black-friday-cyber-monday-playbook']],
    sections: [
      { h: 'Why timing matters', body: [
        'Prices fall when retailers need to clear space for new stock, when shoppers are distracted by a holiday, or when competitors are running a major event. These moments repeat every year, which means patient shoppers can plan around them. The calendar below reflects typical patterns in the US and Canada — not guarantees — so always confirm with a price check.',
      ]},
      { h: 'January – March', body: [
        '- January: fitness equipment, bedding and linens, and post-holiday clearance on decorations and winter apparel. TVs are often discounted ahead of the big-game weekend.',
        '- February: long-weekend sales in the US and several Canadian provinces commonly feature mattresses, appliances and furniture.',
        '- March: winter gear clearance, plus spring-cleaning promotions on vacuums and home organization.',
      ]},
      { h: 'April – June', body: [
        '- April: spring tool and lawn-equipment promotions at home-improvement retailers.',
        '- May: long-weekend sales on appliances, grills and outdoor furniture in both countries.',
        '- June: early summer sales on fitness trackers and outdoor gear; Father’s Day promotions on tools and grooming.',
      ]},
      { h: 'July – September', body: [
        '- July: major online summer sales events from the largest marketplaces, with competitors responding at the same time. Back-to-school laptops and dorm supplies start dropping.',
        '- August: back-to-school pricing on laptops, tablets, backpacks and kids’ clothing.',
        '- September: previous-generation phones and smartwatches often get cheaper after new models launch. End-of-summer clearance on patio furniture and grills.',
      ]},
      { h: 'October – December', body: [
        '- October: fall marketplace sales events and early holiday previews.',
        '- November: Black Friday and Cyber Monday — the deepest discounts of the year on TVs, headphones, smart home and small appliances.',
        '- December: last-minute gift deals, then Boxing Day in Canada (December 26), one of the country’s biggest shopping days, and year-end clearance everywhere.',
      ]},
      { h: 'Make the calendar work for you', body: [
        'Pick the one or two big purchases you are planning this year and put their best month on your calendar. Set a price alert a few weeks before. When the window opens, you will already know the baseline price and can buy confidently when the drop is real.',
      ]},
    ],
  },
  {
    slug: 'coupon-stacking-and-cashback',
    title: 'Coupon Stacking & Cashback, Explained',
    dek: 'The order you apply discounts matters. Here is how sale prices, promo codes, discounted gift cards, cashback portals and card rewards layer together.',
    topic: 'Smart Shopping', updated: '2026-10-20', minutes: 6,
    related: [['Coupons by store', '/coupons'], ['Daily.Deals cashback', '/cashback']],
    sections: [
      { h: 'The five layers of savings', body: [
        '- Layer 1 — The sale price: the markdown the retailer is already offering.',
        '- Layer 2 — A promo code or coupon: a sitewide or category code applied at checkout.',
        '- Layer 3 — A discounted gift card: buying a retailer’s gift card for less than face value, then paying with it.',
        '- Layer 4 — A cashback portal or rewards program: a percentage returned after the purchase tracks.',
        '- Layer 5 — Credit card rewards: points or cash back on the payment itself, ideally on a card you pay in full.',
        'Not every purchase allows every layer, but combining even three can turn a modest sale into a meaningful saving.',
      ]},
      { h: 'Rules that protect your cashback', body: [
        'Cashback depends on tracking, and tracking is fragile. Start from the cashback portal’s link, complete the purchase in the same browser session, and avoid detouring through other coupon sites mid-checkout — that can overwrite the tracking cookie. Ad blockers and strict privacy modes can also prevent tracking, so pause them for that session if your portal recommends it.',
        'Read the exclusions. Gift card purchases, certain brands and marketplace sellers are frequently excluded from cashback, and using an unlisted promo code can void it.',
      ]},
      { h: 'When a coupon code is worth hunting', body: [
        'Codes matter most on fashion, beauty, home goods and direct-to-consumer brands, where sitewide codes are common. For electronics at large retailers, codes are rare and the sale price is usually the whole story. Give yourself a two-minute limit: if you cannot find a working code quickly, the sale price is probably the best you will get.',
      ]},
      { h: 'Avoid the traps', body: [
        'Never spend more to reach a free-shipping threshold unless you were going to buy the extra item anyway. Treat rewards points as a discount on things you need, not a reason to shop. And always compare the final total — after codes, shipping and tax — against a competitor’s plain sale price.',
      ]},
    ],
  },
  {
    slug: 'price-matching-guide',
    title: 'Price Matching: How It Works and How to Ask',
    dek: 'Many large retailers will match a lower price — if you know the rules. A clear, polite approach that gets results in store and online.',
    topic: 'Smart Shopping', updated: '2026-10-12', minutes: 5,
    sections: [
      { h: 'What price matching is', body: [
        'A price match is a retailer’s promise to sell you an item for the same price a qualifying competitor is advertising. Some retailers also offer price adjustments, refunding the difference if their own price drops within a set period after you buy. Policies vary widely, change often, and are usually published on the retailer’s website — always read the current version before you rely on it.',
      ]},
      { h: 'What usually qualifies', body: [
        '- The identical item: same brand, model number, size and colour.',
        '- A competitor on the retailer’s approved list, often limited to major national chains and their official websites.',
        '- A price that is currently available to the public and in stock.',
      ]},
      { h: 'What is usually excluded', body: [
        '- Third-party marketplace sellers, auction sites and membership-only warehouse prices.',
        '- Doorbusters, lightning deals, clearance, open-box and limited-quantity offers.',
        '- Bundles, financing offers, rebates and gift-with-purchase promotions.',
        '- Major holiday events — some retailers suspend matching during Black Friday week.',
      ]},
      { h: 'How to ask', body: [
        'Have the competitor’s live product page ready on your phone, with the price, model number and stock status visible. At checkout or through online chat, say you would like to buy today and ask whether they can match the advertised price. Keep it short and friendly. If the first answer is no, ask whether a price adjustment or a comparable promotion is available instead.',
      ]},
    ],
  },
  {
    slug: 'open-box-refurbished-guide',
    title: 'Open-Box, Refurbished and Renewed: What You Are Really Buying',
    dek: 'Second-hand-adjacent electronics can save 15–40%. Here is how to read condition grades, warranties and return windows before you buy.',
    topic: 'Buying Guides', updated: '2026-09-30', minutes: 6,
    related: [['Daily Clearance', '/deals/clearance']],
    sections: [
      { h: 'The three main categories', body: [
        '- Open-box: a product returned or used as a display model, inspected and resold. Often like-new, sometimes missing accessories.',
        '- Manufacturer refurbished: repaired, tested and re-certified by the brand, often with a new battery and a fresh warranty.',
        '- Seller refurbished or renewed: refurbished by a third party under a retailer’s program. Quality depends on the program’s standards.',
      ]},
      { h: 'Read the grade, then read the fine print', body: [
        'Condition grades such as “Excellent”, “Good” or “Fair” are not standardized across retailers. Look for a written description of cosmetic wear, battery health for phones and laptops, and exactly which accessories are included. A missing charger or remote can wipe out the saving.',
      ]},
      { h: 'Warranty and returns are the real product', body: [
        'The discount is only worth it if the safety net is solid. Prefer listings with at least a 90-day warranty — a year is better — and a return window at least as long as the retailer’s standard policy. Manufacturer-refurbished items with a full warranty are often the best balance of price and peace of mind.',
      ]},
      { h: 'When to skip it', body: [
        'Skip used or refurbished items where wear is invisible and expensive: mattresses, earbuds you cannot sanitize easily, and laptops with no stated battery health. For televisions, monitors and appliances, ask about dead pixels, panel damage and delivery terms before you commit.',
      ]},
    ],
  },
  {
    slug: 'canadian-shopping-guide',
    title: 'The Canadian Shopper’s Guide to Deals, Duties and Boxing Day',
    dek: 'Cross-border shipping, currency, duties and the uniquely Canadian sales calendar — everything to know before you check out.',
    topic: 'Canada', updated: '2026-10-25', minutes: 7,
    related: [['Daily Canadian deals', '/deals/canada']],
    sections: [
      { h: 'Shop Canadian storefronts first', body: [
        'Prices on Canadian storefronts are in Canadian dollars, include domestic shipping options, and come with Canadian warranties and return addresses. A US price that looks cheaper often isn’t once you convert the currency, add cross-border shipping and account for duties, taxes and brokerage fees.',
      ]},
      { h: 'Duties and taxes on US orders', body: [
        'Under the Canada–US–Mexico Agreement, courier shipments from the US have had duty and tax thresholds that make small orders cheaper to import — at the time of writing, duty-free up to CAD $150 and tax-free up to CAD $40 for qualifying goods. Above those values, expect GST/HST and possibly duty, plus a courier brokerage fee. Rules change, so confirm current thresholds with the Canada Border Services Agency before a large order.',
        '- Look for retailers that collect duties at checkout (“duties included”) so there are no surprises at the door.',
        '- Postal shipments and courier shipments can be handled differently; check how your order will ship.',
      ]},
      { h: 'The Canadian sales calendar', body: [
        '- Boxing Day (December 26) and Boxing Week: Canada’s classic clearance event, with deep cuts on electronics, apparel and home goods.',
        '- Black Friday and Cyber Monday: now just as important in Canada as in the US, with most national chains participating.',
        '- Long weekends — Family Day, Victoria Day, Canada Day, Civic Holiday, Labour Day and Thanksgiving — typically bring appliance, furniture and outdoor sales.',
        '- Weekly flyers from grocers, pharmacies and big-box stores remain a reliable source of loss-leader deals.',
      ]},
      { h: 'Loyalty programs worth having', body: [
        'Points programs tied to grocery, pharmacy, fuel and hardware purchases can return meaningful value over a year, especially when stacked with weekly bonus-point offers. Pick one or two that match where you already shop rather than chasing every program.',
      ]},
    ],
  },
  {
    slug: 'tv-buying-guide',
    title: 'TV Deals: What Specs Matter and Which Discounts to Trust',
    dek: 'Panel types, refresh rates, model-year timing and the “derivative model” problem — so you can recognize a genuinely good TV price.',
    topic: 'Buying Guides', updated: '2026-10-18', minutes: 6,
    related: [['Electronics deals', '/category/electronics']],
    sections: [
      { h: 'Size first, then panel', body: [
        'Measure your wall and seating distance before anything else. For most living rooms, a bigger screen improves the experience more than any single spec. Then decide on the panel: OLED delivers perfect blacks and wide viewing angles; mini-LED and quantum-dot LED sets get brighter and handle sunny rooms well; basic LED sets are fine for bedrooms and kitchens.',
      ]},
      { h: 'Specs that actually matter', body: [
        '- Native 120Hz refresh rate if you game on a current console or PC. Marketing “motion rates” are not the same.',
        '- HDMI 2.1 ports for 4K at 120Hz and variable refresh rate.',
        '- Local dimming zones (for LED sets), which improve contrast more than resolution claims.',
        '- A smart platform you like — or plan to use an external streaming stick anyway.',
      ]},
      { h: 'Timing and model years', body: [
        'Manufacturers refresh lineups in the spring. Last year’s models are usually cheapest from late fall through early spring, and the picture-quality difference between consecutive model years is often small. Black Friday and the weeks before major sporting events are traditionally strong windows.',
      ]},
      { h: 'The derivative-model trap', body: [
        'During big events, some retailers sell versions of popular TVs with slightly different model numbers, which can mean fewer HDMI 2.1 ports or a lower-quality panel. Search the exact model number and compare it to the brand’s main lineup before you buy a doorbuster.',
      ]},
    ],
  },
  {
    slug: 'laptop-buying-guide',
    title: 'Laptop Deals: The Specs That Make a Sale Worth It',
    dek: 'A no-nonsense guide to processors, memory, storage and screens — and the cheap-laptop red flags that turn savings into regret.',
    topic: 'Buying Guides', updated: '2026-10-08', minutes: 6,
    related: [['Electronics deals', '/category/electronics']],
    sections: [
      { h: 'Match the laptop to the job', body: [
        'Web, email and documents need far less power than video editing or gaming. Decide what you will actually do on the machine, then buy the cheapest laptop that does it comfortably for the next four or five years.',
      ]},
      { h: 'Baseline specs for most people', body: [
        '- 16GB of RAM for comfortable multitasking; 8GB is a compromise in 2026.',
        '- A solid-state drive (SSD) of 512GB or more. Avoid eMMC storage on Windows laptops.',
        '- A current or previous-generation processor from a major line; very old chips are a common way to make a laptop look cheap.',
        '- A screen of at least 1920×1080 resolution with decent brightness; dim panels are the most common complaint on budget models.',
      ]},
      { h: 'Red flags in a “too good” laptop deal', body: [
        'Watch for discontinued models sold years after release, 4GB of RAM, 64GB or 128GB of storage, low-resolution screens and very short warranties. These machines often feel slow within months, which makes the low price expensive in hindsight.',
      ]},
      { h: 'When to buy', body: [
        'Back-to-school season and Black Friday are the strongest windows for mainstream laptops. Previous-generation models often drop when new chips launch, and they are usually the best value for everyday users.',
      ]},
    ],
  },
  {
    slug: 'avoid-online-shopping-scams',
    title: 'How to Avoid Fake Deals and Online Shopping Scams',
    dek: 'Impostor stores, too-good-to-be-true social ads, and delivery-text phishing are on the rise. Here is how to shop safely.',
    topic: 'Safety', updated: '2026-11-02', minutes: 5,
    sections: [
      { h: 'Red flags of a fake store', body: [
        '- Prices 70–90% below every other retailer on a popular, in-demand product.',
        '- A web address that is almost right — extra words, hyphens or an unusual domain ending.',
        '- No physical address, no working phone number, and a contact page that is only a form.',
        '- Payment only by wire transfer, cryptocurrency, gift cards or peer-to-peer apps.',
        '- A brand-new site with glowing reviews and no independent mentions anywhere else.',
      ]},
      { h: 'Safer ways to pay', body: [
        'Credit cards and established payment services offer dispute and chargeback protection that bank transfers and gift cards do not. Use them for any retailer you have not bought from before.',
      ]},
      { h: 'Delivery and order phishing', body: [
        'During busy shopping seasons, scam texts and emails claiming a package problem or an order issue become common. Do not tap the link. Open the retailer’s app or type its address yourself, and check your order history directly.',
      ]},
      { h: 'How Daily.Deals helps', body: [
        'Every deal on Daily.Deals points to a retailer or an established deal source, and our automated checks skip listings without a recognizable seller. If something on our site ever looks wrong, report it through our contact page and we will review it quickly.',
      ]},
    ],
  },
  {
    slug: 'grocery-savings-guide',
    title: 'Cut Your Grocery Bill Without Clipping Coupons All Weekend',
    dek: 'Unit pricing, store brands, flyers and loyalty apps — the habits that consistently lower the weekly total.',
    topic: 'Smart Shopping', updated: '2026-09-22', minutes: 5,
    sections: [
      { h: 'Plan around the flyer, not the craving', body: [
        'Weekly flyers lead with “loss leaders” — items priced at or below cost to bring you into the store. Build two or three meals around those items each week and stock up on shelf-stable staples when they hit their lowest prices.',
      ]},
      { h: 'Read the unit price label', body: [
        'The shelf tag’s price per 100g, per litre or per count is the real comparison. Store brands frequently win, and the “family size” is not always cheapest per unit.',
      ]},
      { h: 'Use one loyalty app well', body: [
        'Loyalty apps load personalized offers every week. Spend two minutes activating offers before each trip rather than chasing several programs. Many apps also let you scan receipts for points on items you were already buying.',
      ]},
      { h: 'Waste less, save more', body: [
        'The cheapest food is the food you do not throw away. A short list, a quick fridge check before shopping and a weekly “use it up” meal often save more than any coupon.',
      ]},
    ],
  },
  {
    slug: 'price-alerts-guide',
    title: 'Set Price Alerts That Actually Help You Buy at the Right Time',
    dek: 'How to choose a target price, which products are worth tracking, and how to avoid alert fatigue.',
    topic: 'Smart Shopping', updated: '2026-10-30', minutes: 4,
    related: [['Create an alert with Deal Concierge', '/concierge#alerts']],
    sections: [
      { h: 'Track products, not categories', body: [
        'Alerts work best for a specific item you already want: a model of headphones, a vacuum, a game. Broad alerts such as “TVs on sale” create noise that you will quickly learn to ignore.',
      ]},
      { h: 'Pick a target price with history', body: [
        'Look at the product’s recent price range. A good target is at or slightly above its lowest price in the last three to six months. Setting the target too low means the alert may never fire; too high and you will buy before the real drop.',
      ]},
      { h: 'Decide in advance', body: [
        'When an alert hits your target, buy. The point of setting a target is to remove the second-guessing. If you hesitate, the price is probably not low enough for you — adjust the target rather than ignoring the alerts.',
      ]},
      { h: 'Let us watch for you', body: [
        'Daily.Deals Deal Concierge lets you tell us what you are shopping for and your target price. We watch our deal feeds and send you the matches. It is free, and you can stop at any time.',
      ]},
    ],
  },
  {
    slug: 'subscriptions-and-bills-savings',
    title: 'The Subscription & Bill Audit: Save Every Month, Not Just on Sale Days',
    dek: 'Streaming, phone, internet and memberships quietly add up. A one-hour audit that keeps paying off.',
    topic: 'Smart Shopping', updated: '2026-09-15', minutes: 5,
    sections: [
      { h: 'List every recurring charge', body: [
        'Scroll through three months of card and bank statements and write down every recurring payment. Most people find at least one subscription they forgot about.',
      ]},
      { h: 'Rotate streaming services', body: [
        'Keep one or two streaming services at a time and rotate them every few months based on what you actually watch. Annual plans can be cheaper, but only if you would keep the service all year.',
      ]},
      { h: 'Call phone and internet providers', body: [
        'Promotional rates expire quietly. Check the current offers for new customers, then contact your provider and ask whether they can match or beat them for you. Be polite, specific and prepared to switch — that is what gives you leverage.',
      ]},
      { h: 'Make memberships earn their keep', body: [
        'Warehouse clubs, shipping memberships and paid rewards tiers are worth it only if your savings exceed the fee. Estimate your yearly benefit honestly; if the math is close, try going without for a month.',
      ]},
    ],
  },
  {
    slug: 'big-online-sales-events-guide',
    title: 'Big Online Sales Events: How to Win Marketplace Sale Days',
    dek: 'Summer and fall marketplace sales are huge — and noisy. A focused strategy for finding the real deals among thousands.',
    topic: 'Sales Calendar', updated: '2026-10-05', minutes: 5,
    related: [['Daily Hot deals', '/deals/hot']],
    sections: [
      { h: 'Focus on the retailer’s own devices and top brands', body: [
        'The deepest, most reliable discounts during marketplace events tend to be on the marketplace’s own devices and on well-known brands that commit to the event. Thousands of listings carry badges, but most are routine discounts.',
      ]},
      { h: 'Check the seller and the price history', body: [
        'Confirm the item is sold or fulfilled by a reputable seller, then check its price history. If the “deal” price matches what the item sold for last month, move on.',
      ]},
      { h: 'Competitors respond at the same time', body: [
        'Other major retailers usually run competing sales during the same days. Before buying, compare the same model at two or three other stores — you may get the same price with a better return policy or faster pickup.',
      ]},
      { h: 'Avoid the impulse cart', body: [
        'Fill your cart with your short list before the event starts. When it begins, check prices on those items first. Browsing the rest of the event is fine — but set a budget before you start.',
      ]},
    ],
  },
]

export function getGuide(slug: string): Guide | undefined { return GUIDES.find(g => g.slug === slug) }
