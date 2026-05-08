import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vaxhdxgrdukqylrelwjk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheGhkeGdyZHVrcXlscmVsd2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTkyNzIsImV4cCI6MjA5Mzc3NTI3Mn0.6PHlixbcrXuBdTgOY36Zl6q7fiK7f7vrBNq75DndUIc'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  let i = 0
  const pgSql = sql.replace(/\?/g, () => `$${++i}`)
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: pgSql,
    sql_params: params || []
  })
  if (error) throw new Error(error.message)
  return (data || []) as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

export default supabase
