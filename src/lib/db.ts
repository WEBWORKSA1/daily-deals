import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export default pool

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
  let i = 0
  const pgSql = sql.replace(/\?/g, () => `$${++i}`)
  const result = await pool.query(pgSql, params)
  return result.rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
