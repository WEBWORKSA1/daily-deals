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

// Idempotent migration list — runs in order, skipping already-applied
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
]
