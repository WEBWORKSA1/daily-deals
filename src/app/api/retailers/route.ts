import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(req: NextRequest) {
  const country = new URL(req.url).searchParams.get('country')
  try {
    let q = supabase.from('retailers').select('*').eq('is_active', true)
    if (country) q = q.in('country', [country, 'BOTH'])
    const { data, error } = await q.order('name')
    if (error) throw error
    return NextResponse.json({ retailers: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
