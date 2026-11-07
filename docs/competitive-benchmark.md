# Daily.Deals — Competitive Benchmark (November 2026)

We reviewed 35 deal, coupon, cashback and price-tracking sites live on November 7, 2026. Nine more sites blocked automated review.

**Reviewed (35):** Slickdeals, DealNews, Brad's Deals, RedFlagDeals, HotUKDeals, 9to5Toys, OzBargain, Groupon, Dealabs, Hip2Save, The Krazy Coupon Lady, Dealmoon, Ben's Bargains, TopCashback, Woot, Honey, Rakuten, DealCatcher, DealsPlus, Capital One Shopping, PriceSpy, SmartCanucks, Mydealz, DesiDime, CheapShark, Savings.com, Dealspotr, Coupons.com, Keepa, BrickSeek, Flipp, Ibotta, CouponFollow, Knoji, Picodi.

**Blocked review (9):** RetailMeNot, Offers.com, TechBargains, Wirecutter Deals, CouponCabin, camelcamelcamel, DealsOfAmerica, GottaDeal, Swagbucks. These were benchmarked from known public features only.

## Feature matrix

Status key:
- **Now**: shipped in this release.
- **Had**: already in the codebase.
- **Next**: on the roadmap.

| Feature (who does it best) | Daily.Deals |
|---|---|
| Ranked frontpage feed with vote/heat score (Slickdeals, HotUKDeals, OzBargain, DesiDime) | Had (hotness score) + Now (live layer ranks every source) |
| Popular / Hottest / Trending / New tabs (HotUKDeals, Mydealz, Dealabs) | Now: Daily Hot / Flash / Clearance / US / Canadian / Edition |
| AI deal score with explanation (DealCatcher) | Had (Claude curator) + Now (rule-based fallback, Daily Edition notes per deal) |
| Staff picks with "why I picked it" (DealNews, Brad's Deals) | Now: The Daily Edition (auto-written top 10 with editorial blurbs) |
| Expiry dates, urgency tags (DealNews, OzBargain, Brad's Deals) | Had (countdown) + Now (expiry ingested from feeds) |
| Copy-to-clipboard promo codes (DealNews) | Had (coupon chip) |
| Coupon pages by store (RetailMeNot, Savings.com, CouponFollow, Knoji) | Now: /coupons + 16 store savings guides + /amazon-coupons-style aliases |
| Coupon "did it work?" voting (Dealspotr) | Had (CouponFeedback) |
| Price history charts (Keepa, camelcamelcamel, BrickSeek) | Had (PriceChart on DB deals) |
| Price-drop alerts / deal alerts (Slickdeals, RFD, Honey Droplist, CheapShark) | Now: Deal Concierge (target-price watch) + category alerts |
| Request-a-deal / Help me find a deal (Slickdeals, RFD) | Now: Deal Concierge |
| Community deal submission (Slickdeals, OzBargain, Dealmoon) | Now: working submission form (it was previously fake) |
| Comments and voting (Slickdeals, DesiDime) | Had |
| Giveaways and competitions (OzBargain Comps, Slickdeals Giveaways, Dealmoon) | Now: monthly auto-rolling Daily Draw + Official Rules + referral link |
| Contributor recognition (OzBargain Members of the Month, Dealspotr rewards) | Now: Deal Hunter of the Month |
| Newsletter with incentive (DealNews, KCL, Savings.com) | Now: working footer signup + Concierge opt-in |
| SMS / Telegram / WhatsApp alerts (KCL, DesiDime) | Next |
| Cashback (Rakuten, TopCashback, Coupons.com) | Had (/cashback) |
| Browser extension (Honey, Capital One Shopping, Keepa) | Had (/extension) |
| Mobile app / PWA (most) | Had (PWA install prompt) |
| Video content (9to5Toys) | Now: self-updating video hub (YouTube RSS, lite embeds) |
| Buying guides / editorial (DealNews, KCL Savings Hacks, Brad's Deals) | Now: 14 original guides |
| Sales calendar (KCL monthly calendar) | Now: "Best time to buy" month-by-month guide |
| Audience discount hubs (Hip2Save, Brad's Deals: military, student, teacher) | Next |
| Weekly flyers / local by postal code (Flipp, SmartCanucks, RFD) | Had (43,140 ZIP/FSA geo) + Next (flyers) |
| Canadian focus (RFD, SmartCanucks, Flipp) | Now: Daily Canadian, Canadian shopping guide, RFD + r/bapcsalescanada sources |
| Local merchant deals (Groupon) | Now: local-business listing form |
| Sponsored placements, clearly labelled (DealNews, Slickdeals, DealCatcher) | Now: /advertise packages + lead form |
| Advertise / media kit (Brad's Deals, RFD, OzBargain) | Now: /advertise |
| Affiliate disclosure (all) | Now: rewritten, Amazon Associates statement |
| Trust: human-behind-every-post, editorial independence (Brad's Deals) | Now: About › How we pick, Disclosure › Editorial independence |
| Source attribution | Now: "Spotted via …" on every live deal |
| Cookie consent / Do-not-sell (KCL) | Now: consent banner + Google Consent Mode v2 |
| Careers page (TopCashback) | Now: /careers with JobPosting schema |
| Reader support / donations | Now: /support (purpose-tiered, one-time/monthly) — none of the 35 offer this; differentiator |
| Domain / partnership inquiry banner | Now: sitewide top banner |

## Where Daily.Deals now leads

1. **It never goes empty.** The live multi-source layer means the site keeps refreshing even when scrapers or the database stall. That failure mode emptied the live site before this release.
2. **Editorial plus automation.** An auto-written Daily Edition every morning, in a calm Wirecutter-style voice. Most competitors are either pure feeds or labour-heavy blogs.
3. **US and Canada in one place**, with storefront-aware links. Canadian deals send people to Canadian storefronts.
4. **A dedicated, high-intent lead funnel** (Deal Concierge), giveaways and reader support. Most deal sites capture only a bare email.
