import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vaxhdxgrdukqylrelwjk.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase

// Generic query function that mimics the old MySQL interface
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  // Convert parameterized query to Supabase RPC or raw query
  let i = 0
  const pgSql = sql.replace(/\?/g, () => `$${++i}`)
  
  const { data, error } = await supabase.rpc('execute_sql', { 
    query: pgSql, 
    params: params || [] 
  })
  
  if (error) throw error
  return (data || []) as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
