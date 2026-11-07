# Daily.Deals — Operations

## November 2026 platform update — fully automatic, always fresh

| Layer | What it does |
|---|---|
| **Live deal layer** (`src/lib/feeds/`) | Pulls 8 public deal sources (dealnews, 9to5Toys, Slickdeals ×2, RedFlagDeals, r/buildapcsales, r/bapcsalescanada, CheapShark) every 30 min, normalizes price/retailer/category/country, de-duplicates, scores, and credits the source. Shopping links are monetized server-side (Amazon tag / Skimlinks) via signed `/go` redirects. |
| **Unified data** (`src/lib/data.ts`) | Every page reads DB deals first, then tops up from the live layer, so pages are never empty. |
| **Daily Edition** (`/deals/today`) | Auto-written front page each morning (Claude note when `ANTHROPIC_API_KEY` is set, editorial template otherwise). |
| **Self-healing pipeline** | Curator falls back to rule-based scoring without an API key; deals default to 72h; expiry never drains below 24 active deals. |
| **Video hub** (`/videos`) | YouTube channel RSS (no key), cached 6h, lite embeds. |
| **Content** | 14 original guides (`/guides`), 16 store savings guides (`/coupons/[store]`), SEO aliases (`/amazon-coupons` → `/coupons/amazon`). |
| **Engagement & revenue** | Deal Concierge lead funnel, monthly Daily Draw giveaway + rules, Support (donations), Advertise/Sponsor, Careers, Submit a deal. |
| **Forms** (`/api/forms`) | One endpoint for every form. Destination inbox lives only server-side; delivery via Resend → Web3Forms → FormSubmit; stored in Supabase `leads` (insert-only) with Netlify Blobs fallback. |
| **AdSense** | Site-wide script in `<head>`, `ads.txt`, Consent Mode v2 + consent banner, optional manual slots via env. |
| **Cron** | Hourly: expire → hotness → prices → alerts → `/api/refresh` (re-warms live feed + videos). Every 6h: scrape + curate. |

### One-time owner checklist
1. **FormSubmit activation** — after the first form submission, open the "Activate Form" email in the inbox and click it (or set `RESEND_API_KEY` / `WEB3FORMS_ACCESS_KEY` in Netlify to skip this).
2. **AdSense** — in AdSense → Sites, add `daily.deals` and request review; in Privacy & messaging, publish the EU consent message (Google-certified CMP for EEA/UK traffic).
3. **Giveaway prize** — confirm or change the prize in `src/lib/contests.ts` (or `NEXT_PUBLIC_CONTEST_PRIZE`).
4. Optional: `STRIPE_DONATION_LINK` or `PAYPAL_HOSTED_BUTTON_ID` for donations (PayPal by account is the default).

See `docs/competitive-benchmark.md` for the 35-site feature benchmark and `.env.example` for every setting.
