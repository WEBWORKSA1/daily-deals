import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres:DailyDeals2024@db.vaxhdxgrdukqylrelwjk.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

export default pool

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  let i = 0
  const pgSql = sql.replace(/\?/g, () => `$${++i}`)
  const result = await pool.query(pgSql, params)
  return result.rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
