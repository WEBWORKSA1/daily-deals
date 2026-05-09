# Daily.Deals

Location-aware deal aggregator for the US and Canada. Every day, every deal.

**Live**: [daily.deals](https://daily.deals)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Auth | Cookie-based passwordless email |
| Hosting | Netlify (auto-deploys from `main`) |
| Cron | Netlify Scheduled Functions (`@hourly`) |
| Search | Postgres ILIKE + custom hotness ranking |
| OG images | `next/og` (Edge runtime) |

## Project structure

```
.
├── netlify/
│   └── functions/
│       └── hourly-cron.mts          # Scheduled job — runs every hour
├── public/
│   ├── extension/                   # Chrome/FF extension manifest v3 + content script
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service worker
│   ├── robots.txt
│   └── icon.svg
├── src/
│   ├── app/
│   │   ├── [slug]/                  # Dynamic SEO landing pages (best-deals-today, etc.)
│   │   ├── deal/[id]/               # Deal detail page + per-deal og-image route
│   │   ├── deals/{today,flash,hot,clearance,us,canada}/
│   │   ├── store/[slug]/            # Per-retailer deal pages
│   │   ├── category/[slug]/         # Per-category deal pages
│   │   ├── search/                  # Search UI
│   │   ├── account/                 # Saved deals / alerts / profile
│   │   ├── cashback/                # Cashback wallet dashboard
│   │   ├── extension/               # Browser extension landing
│   │   ├── for-you/                 # Personalized feed
│   │   ├── admin/{moderation,scout}/
│   │   ├── api/
│   │   │   ├── admin/{migrate,status,expire-deals,recompute-hotness,
│   │   │   │          snapshot-prices,process-alerts}/
│   │   │   ├── auth/                # passwordless login
│   │   │   ├── cashback/            # click tracking + balance
│   │   │   ├── clicks/              # affiliate URL augmentation + analytics
│   │   │   ├── comments/, flags/    # community moderation
│   │   │   ├── coupon-feedback/     # works/doesn't work voting
│   │   │   ├── deals/, retailers/   # public read APIs
│   │   │   ├── for-you/             # personalization engine
│   │   │   ├── price-history/       # price snapshots
│   │   │   ├── saves/, votes/       # user actions
│   │   │   ├── scout/{run,queue}/   # AI deal scout (RSS ingest)
│   │   │   ├── search/              # full-text + facets
│   │   │   ├── subscribers/, alerts/# newsletter + price alerts
│   │   │   └── extension/download/  # ZIP bundle for browser extension
│   │   ├── sitemap.ts               # Dynamic sitemap.xml
│   │   ├── layout.tsx               # Root layout — Org/WebSite JSON-LD
│   │   └── page.tsx                 # Homepage — auto-bootstraps DB on cold start
│   ├── components/
│   │   ├── deals/{DealCard,GetDealButton,ShareBar,PriceHistoryChart,...}.tsx
│   │   ├── ui/{Hero,FeaturedDeal,DealSection,DealTicker,SearchBar,
│   │   │        LocalDeals,LocationModal,InstallPrompt,Newsletter,...}.tsx
│   │   └── layout/{Header,Footer}.tsx
│   ├── lib/
│   │   ├── auth.ts                  # Cookie-based session helpers
│   │   ├── autoBootstrap.ts         # First-traffic migration runner
│   │   ├── managementSQL.ts         # 10 migrations + Supabase Management API runner
│   │   ├── hotness.ts               # 0-100 score: engagement+discount+recency+urgency
│   │   ├── priceHistory.ts          # Snapshot + trend classification
│   │   ├── cashback.ts              # Click ID generation + sale confirmation
│   │   ├── forYou.ts                # Personalization signal aggregator
│   │   ├── scout.ts                 # RSS-based AI deal candidate scoring
│   │   ├── schema.ts                # Product/Offer/Breadcrumb JSON-LD
│   │   ├── postalCodes.ts           # 60 hardcoded + Zippopotam fallback
│   │   ├── storeAnchors.ts          # 19 retailer geo-anchors
│   │   ├── db.ts                    # Supabase client
│   │   └── utils.ts                 # buildAffiliateLink, formatPrice, CATEGORIES
│   ├── hooks/useLocation.ts
│   └── types/index.ts
├── netlify.toml
└── package.json
```

## Auto-bootstrap

Sandbox can't reach Supabase directly, so migrations run **server-side on first cold-start traffic**. The pattern:

- Homepage `page.tsx` fires `runAutoBootstrap()` (in `src/lib/autoBootstrap.ts`)
- `autoBootstrap` checks `_dd_migrations` table, runs any unapplied migrations from `managementSQL.ts` via the Supabase Management API (using `SUPABASE_PAT`)
- Idempotent — safe to run on every cold start

## Cron jobs

`netlify/functions/hourly-cron.mts` fires every hour and pings five admin endpoints in parallel:

| Endpoint | Purpose |
|---|---|
| `/api/admin/expire-deals` | Mark deals past `expires_at` inactive |
| `/api/admin/recompute-hotness` | Rebuild 0-100 hotness scores; promote top-3 to Editor's Choice |
| `/api/admin/snapshot-prices` | Insert into `deal_price_history`; recompute `lowest/highest/avg_30d/trend` |
| `/api/scout/run` | Process RSS feeds in `scout.ts` SCOUT_FEEDS, queue candidates |
| `/api/admin/process-alerts` | Match new deals against subscriber criteria |

All admin endpoints require `X-Cron-Secret` header matching `CRON_SECRET` env var.

## Required environment variables

Set these in **Netlify → Site settings → Environment variables** (all 4 deploy contexts):

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vaxhdxgrdukqylrelwjk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public) |
| `SUPABASE_PAT` | Personal Access Token for Management API (DDL) |
| `SUPABASE_PROJECT_REF` | `vaxhdxgrdukqylrelwjk` |
| `CRON_SECRET` | Random 32-char string used by hourly-cron → admin endpoints |
| `NEXT_PUBLIC_AMAZON_US_TAG` | Your Amazon Associates US tag (e.g. `dailydeals-us-20`) |
| `NEXT_PUBLIC_AMAZON_CA_TAG` | Your Amazon Associates CA tag |
| `NEXT_PUBLIC_SITE_URL` | `https://daily.deals` |

Optional (for email send to actually work):
- `RESEND_API_KEY` or `POSTMARK_API_KEY` + `EMAIL_FROM`

## Database migrations

Stored in `src/lib/managementSQL.ts` as a `MIGRATIONS` array. Numbered:

1. `postal_code_locations` table
2. `retailers` geo columns
3. `deals` geo columns
4. `_dd_migrations` tracking table
5. Hotness columns on `deals`
6. Newsletter `email_subscribers` extensions + `deal_alerts`
7. `users` + `user_saved_deals` + `user_votes`
8. `deal_price_history` + `coupon_feedback`
9. `deal_comments` + `flags`
10. `cashback_events` + `user_cashback_balance` + retailer cashback rates

To force-run all migrations manually: `POST /api/admin/migrate` with `X-Cron-Secret`.
To check what's applied: `GET /api/admin/status`.

## SEO

- `robots.txt` — blocks `/api`, `/admin`, `/signin`, `/account`
- `sitemap.xml` — auto-generated hourly, includes every active deal + store + category + landing page
- Per-deal Product/Offer JSON-LD with AggregateRating once 3+ user votes exist
- Per-deal auto-generated 1200×630 OG image at `/deal/{id}/og-image`
- 9 keyword landing pages at `/best-deals-today`, `/amazon-deals-today`, `/best-laptop-deals`, `/best-phone-deals`, `/best-tv-deals`, `/best-gaming-deals`, `/walmart-deals-today`, `/cheap-gadgets-deals`, `/black-friday-deals` — each with FAQ schema

## Revenue

Three revenue streams wired:

1. **Affiliate commissions** — every Get Deal click routes through `/api/clicks` which:
   - Logs the click for analytics
   - Bumps `click_count` (feeds hotness)
   - Returns the URL with the right Amazon/CJ/Impact tag injected per retailer

2. **Cashback** — for signed-in users, `/api/cashback` creates a pending `cashback_events` row with a unique `click_id` injected as `subid`/`sid`/`utm_content`. When the affiliate network reports a confirmed sale, hit `/api/cashback/confirm` to credit the user's wallet. The margin between `commission_rate` and `cashback_rate` per retailer is your kept revenue.

3. **AdSense / programmatic** — slot reserved on category and `/deals/*` pages. Just drop the AdSense script into `layout.tsx` once approved.

## Local development

```bash
npm install
cp .env.example .env.local  # add your Supabase keys
npm run dev
```

Visit http://localhost:3000

## Browser extension

Built in `public/extension/`. Manifest v3, supports 19 retailers (Amazon US/CA, Walmart US/CA, Best Buy US/CA, Target, Costco US/CA, Home Depot US/CA, Lowe's US/CA, Apple, Nike, Sephora, Ulta, Macy's, Nordstrom, eBay).

When user lands on a product page, content script searches Daily.Deals API for hotter alternatives and shows a banner.

Download as ZIP from `/api/extension/download` or visit `/extension` for install instructions.
