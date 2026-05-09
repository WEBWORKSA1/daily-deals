// Run any SQL against Supabase via the Management API.
// Requires SUPABASE_PAT (Personal Access Token) and SUPABASE_PROJECT_REF env vars.

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'vaxhdxgrdukqylrelwjk'

export async function runManagementSQL(sql: string): Promise<{ ok: boolean, data?: any, error?: string }> {
  const pat = process.env.SUPABASE_PAT
  if (!pat) return { ok: false, error: 'SUPABASE_PAT environment variable is not set' }

  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      return { ok: false, error: `${res.status}: ${text}` }
    }

    const data = await res.json()
    return { ok: true, data }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

export const MIGRATIONS: Array<{ id: string, name: string, sql: string }> = [
  {
    id: '001_create_postal_codes',
    name: 'Create postal_code_locations table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.postal_code_locations (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        country VARCHAR(2) NOT NULL,
        city VARCHAR(100) NOT NULL,
        province_state VARCHAR(50),
        state_code VARCHAR(5),
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        source VARCHAR(20) DEFAULT 'seeded',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_postal_code ON public.postal_code_locations(code);
      CREATE INDEX IF NOT EXISTS idx_postal_country ON public.postal_code_locations(country);
      GRANT SELECT ON public.postal_code_locations TO anon, authenticated;
      GRANT INSERT, UPDATE ON public.postal_code_locations TO authenticated;
    `,
  },
  {
    id: '002_extend_retailers_geo',
    name: 'Add geo columns to retailers',
    sql: `
      ALTER TABLE public.retailers
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
        ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
        ADD COLUMN IF NOT EXISTS city VARCHAR(100),
        ADD COLUMN IF NOT EXISTS province_state VARCHAR(50),
        ADD COLUMN IF NOT EXISTS has_physical_stores BOOLEAN DEFAULT FALSE;
    `,
  },
  {
    id: '003_extend_deals_geo',
    name: 'Add geo columns to deals',
    sql: `
      ALTER TABLE public.deals
        ADD COLUMN IF NOT EXISTS is_online_only BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS store_latitude DECIMAL(10, 7),
        ADD COLUMN IF NOT EXISTS store_longitude DECIMAL(10, 7),
        ADD COLUMN IF NOT EXISTS store_city VARCHAR(100),
        ADD COLUMN IF NOT EXISTS store_postal VARCHAR(10);
      CREATE INDEX IF NOT EXISTS idx_deals_geo
        ON public.deals(store_latitude, store_longitude)
        WHERE is_online_only = FALSE;
    `,
  },
  {
    id: '004_create_migrations_log',
    name: 'Create migration tracking table',
    sql: `
      CREATE TABLE IF NOT EXISTS public._dd_migrations (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `,
  },
  {
    id: '005_add_hotness_columns',
    name: 'Add hotness score + verified flags to deals',
    sql: `
      ALTER TABLE public.deals
        ADD COLUMN IF NOT EXISTS hotness_score INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS hotness_updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS is_editors_choice BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;
      CREATE INDEX IF NOT EXISTS idx_deals_hotness
        ON public.deals(hotness_score DESC) WHERE is_active = TRUE;
      CREATE INDEX IF NOT EXISTS idx_deals_editors_choice
        ON public.deals(is_editors_choice) WHERE is_editors_choice = TRUE;
    `,
  },
  {
    id: '006_extend_subscribers',
    name: 'Extend email_subscribers + create deal_alerts',
    sql: `
      ALTER TABLE public.email_subscribers
        ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'US',
        ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
        ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'daily',
        ADD COLUMN IF NOT EXISTS preferred_categories TEXT[],
        ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS confirm_token VARCHAR(64),
        ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64),
        ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP;

      CREATE TABLE IF NOT EXISTS public.deal_alerts (
        id SERIAL PRIMARY KEY,
        subscriber_id INTEGER REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
        keyword VARCHAR(100),
        retailer_slug VARCHAR(50),
        category VARCHAR(50),
        min_discount INTEGER DEFAULT 30,
        max_price DECIMAL(10, 2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        last_matched_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_alerts_subscriber ON public.deal_alerts(subscriber_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.deal_alerts(is_active) WHERE is_active = TRUE;

      GRANT SELECT, INSERT, UPDATE, DELETE ON public.deal_alerts TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.deal_alerts_id_seq TO authenticated, anon;
    `,
  },
  {
    id: '007_user_accounts_and_saves',
    name: 'Create user accounts + saved deals + votes',
    sql: `
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        auth_id UUID UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE,
        display_name VARCHAR(100),
        avatar_url TEXT,
        country VARCHAR(2) DEFAULT 'US',
        postal_code VARCHAR(10),
        karma_score INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        is_moderator BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        last_seen_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

      CREATE TABLE IF NOT EXISTS public.user_saved_deals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        deal_id INTEGER REFERENCES public.deals(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, deal_id)
      );
      CREATE INDEX IF NOT EXISTS idx_saves_user ON public.user_saved_deals(user_id);
      CREATE INDEX IF NOT EXISTS idx_saves_deal ON public.user_saved_deals(deal_id);

      CREATE TABLE IF NOT EXISTS public.user_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        deal_id INTEGER REFERENCES public.deals(id) ON DELETE CASCADE,
        vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, deal_id)
      );
      CREATE INDEX IF NOT EXISTS idx_votes_deal ON public.user_votes(deal_id);
      CREATE INDEX IF NOT EXISTS idx_votes_user ON public.user_votes(user_id);

      ALTER TABLE public.deals
        ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS downvote_count INTEGER DEFAULT 0;

      GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.users_id_seq TO authenticated, anon;
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_saved_deals TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.user_saved_deals_id_seq TO authenticated, anon;
      GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_votes TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.user_votes_id_seq TO authenticated, anon;
    `,
  },
  {
    id: '008_price_history_and_coupons',
    name: 'Add price history + coupon tracking',
    sql: `
      CREATE TABLE IF NOT EXISTS public.deal_price_history (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES public.deals(id) ON DELETE CASCADE,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        discount_percent INTEGER,
        recorded_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_price_history_deal
        ON public.deal_price_history(deal_id, recorded_at DESC);

      CREATE TABLE IF NOT EXISTS public.coupon_feedback (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES public.deals(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
        worked BOOLEAN NOT NULL,
        ip_hash VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_coupon_feedback_deal
        ON public.coupon_feedback(deal_id);
      CREATE INDEX IF NOT EXISTS idx_coupon_feedback_user
        ON public.coupon_feedback(user_id);

      ALTER TABLE public.deals
        ADD COLUMN IF NOT EXISTS coupon_works_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS coupon_fails_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS coupon_success_rate INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS lowest_price_ever DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS highest_price_ever DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS avg_price_30d DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS price_trend VARCHAR(10) DEFAULT 'stable';

      GRANT SELECT, INSERT ON public.deal_price_history TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.deal_price_history_id_seq TO authenticated, anon;
      GRANT SELECT, INSERT ON public.coupon_feedback TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.coupon_feedback_id_seq TO authenticated, anon;
    `,
  },
  {
    id: '009_comments_and_flags',
    name: 'Comments + flags for community moderation',
    sql: `
      CREATE TABLE IF NOT EXISTS public.deal_comments (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER REFERENCES public.deals(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES public.deal_comments(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE,
        flag_count INTEGER DEFAULT 0,
        upvote_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_comments_deal ON public.deal_comments(deal_id);
      CREATE INDEX IF NOT EXISTS idx_comments_user ON public.deal_comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.deal_comments(parent_id);

      CREATE TABLE IF NOT EXISTS public.flags (
        id SERIAL PRIMARY KEY,
        flagged_by_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
        target_type VARCHAR(20) NOT NULL,
        target_id INTEGER NOT NULL,
        reason VARCHAR(50) NOT NULL,
        details TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_by_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
        resolution_action VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_flags_target ON public.flags(target_type, target_id);
      CREATE INDEX IF NOT EXISTS idx_flags_unresolved ON public.flags(is_resolved) WHERE is_resolved = FALSE;

      ALTER TABLE public.deals
        ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0;

      GRANT SELECT, INSERT, UPDATE, DELETE ON public.deal_comments TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.deal_comments_id_seq TO authenticated, anon;
      GRANT SELECT, INSERT ON public.flags TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.flags_id_seq TO authenticated, anon;
    `,
  },
  {
    id: '010_cashback',
    name: 'Cashback tracking — clicks + retailer rates',
    sql: `
      ALTER TABLE public.retailers
        ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 5.00,
        ADD COLUMN IF NOT EXISTS cashback_rate DECIMAL(5, 2) DEFAULT 2.00;

      CREATE TABLE IF NOT EXISTS public.cashback_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        deal_id INTEGER REFERENCES public.deals(id) ON DELETE SET NULL,
        retailer_id INTEGER REFERENCES public.retailers(id) ON DELETE SET NULL,
        click_id VARCHAR(64) UNIQUE,
        status VARCHAR(20) DEFAULT 'pending',
        estimated_purchase_amount DECIMAL(10, 2),
        confirmed_purchase_amount DECIMAL(10, 2),
        cashback_rate DECIMAL(5, 2),
        cashback_amount DECIMAL(10, 2),
        clicked_at TIMESTAMP DEFAULT NOW(),
        confirmed_at TIMESTAMP,
        paid_at TIMESTAMP,
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_cashback_user
        ON public.cashback_events(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_cashback_click
        ON public.cashback_events(click_id);

      CREATE TABLE IF NOT EXISTS public.user_cashback_balance (
        user_id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
        pending_amount DECIMAL(10, 2) DEFAULT 0,
        available_amount DECIMAL(10, 2) DEFAULT 0,
        lifetime_earned DECIMAL(10, 2) DEFAULT 0,
        lifetime_paid DECIMAL(10, 2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW()
      );

      GRANT SELECT, INSERT ON public.cashback_events TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.cashback_events_id_seq TO authenticated, anon;
      GRANT SELECT, INSERT, UPDATE ON public.user_cashback_balance TO authenticated, anon;
    `,
  },
  {
    id: '011_scraped_deals_raw',
    name: 'Raw scraped deals queue (for curator to evaluate)',
    sql: `
      CREATE TABLE IF NOT EXISTS public.scraped_deals_raw (
        id SERIAL PRIMARY KEY,
        retailer_slug VARCHAR(50) NOT NULL,
        retailer_name VARCHAR(100) NOT NULL,
        country VARCHAR(2) NOT NULL,
        source_url TEXT NOT NULL,
        product_url TEXT UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        image_url TEXT,
        category VARCHAR(50),
        deal_price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        discount_percent INTEGER,
        coupon_code VARCHAR(50),
        expires_at TIMESTAMP,
        deal_type VARCHAR(20) DEFAULT 'daily',
        raw JSONB,

        status VARCHAR(20) DEFAULT 'pending',
          -- 'pending' | 'published' | 'rejected' | 'error'
        published_deal_id INTEGER REFERENCES public.deals(id) ON DELETE SET NULL,
        curator_score INTEGER,
        curator_reasoning TEXT,

        scraped_at TIMESTAMP DEFAULT NOW(),
        judged_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_scraped_status
        ON public.scraped_deals_raw(status, scraped_at);
      CREATE INDEX IF NOT EXISTS idx_scraped_retailer
        ON public.scraped_deals_raw(retailer_slug);
      CREATE INDEX IF NOT EXISTS idx_scraped_published
        ON public.scraped_deals_raw(published_deal_id) WHERE published_deal_id IS NOT NULL;
      GRANT SELECT, INSERT, UPDATE ON public.scraped_deals_raw TO authenticated, anon;
      GRANT USAGE ON SEQUENCE public.scraped_deals_raw_id_seq TO authenticated, anon;
    `,
  },
]
