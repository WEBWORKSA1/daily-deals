import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vaxhdxgrdukqylrelwjk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheGhkeGdyZHVrcXlscmVsd2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTkyNzIsImV4cCI6MjA5Mzc3NTI3Mn0.6PHlixbcrXuBdTgOY36Zl6q7fiK7f7vrBNq75DndUIc'

export const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
