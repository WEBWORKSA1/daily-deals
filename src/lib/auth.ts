import { NextRequest } from 'next/server'
import { supabase } from './db'

const COOKIE_NAME = 'dd_session'

export async function getUserFromRequest(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie) return null
  const [userId] = cookie.value.split('.')
  if (!userId) return null
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', parseInt(userId))
      .single()
    return user || null
  } catch {
    return null
  }
}
