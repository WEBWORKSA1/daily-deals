import { NextResponse } from 'next/server'
import { ensureBootstrapped, getBootstrapStatus } from '@/lib/autoBootstrap'
import { supabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Force bootstrap if not done yet
  const result = await ensureBootstrapped()

  // Verify by counting actual rows
  let postalCount = 0
  let dealCount = 0
  let physicalDealCount = 0

  try {
    const { count: pc } = await supabase
      .from('postal_code_locations')
      .select('*', { count: 'exact', head: true })
    postalCount = pc || 0
  } catch {}

  try {
    const { count: dc } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    dealCount = dc || 0
  } catch {}

  try {
    const { count: pdc } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_online_only', false)
    physicalDealCount = pdc || 0
  } catch {}

  return NextResponse.json({
    bootstrap: result,
    status: getBootstrapStatus(),
    counts: {
      postal_codes: postalCount,
      active_deals: dealCount,
      physical_store_deals: physicalDealCount,
      online_only_deals: dealCount - physicalDealCount,
    },
    timestamp: new Date().toISOString(),
  })
}
