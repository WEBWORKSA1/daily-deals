import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

const POSTAL_CODES = [
  ['L6E','CA','Markham','Ontario','ON',43.8561,-79.3370],
  ['L3R','CA','Markham','Ontario','ON',43.8501,-79.3370],
  ['L3P','CA','Markham','Ontario','ON',43.8800,-79.2700],
  ['M5V','CA','Toronto','Ontario','ON',43.6426,-79.3871],
  ['M5H','CA','Toronto','Ontario','ON',43.6500,-79.3800],
  ['M4W','CA','Toronto','Ontario','ON',43.6757,-79.3839],
  ['M5G','CA','Toronto','Ontario','ON',43.6580,-79.3868],
  ['M5J','CA','Toronto','Ontario','ON',43.6440,-79.3800],
  ['L4Y','CA','Mississauga','Ontario','ON',43.5890,-79.6441],
  ['L5M','CA','Mississauga','Ontario','ON',43.5800,-79.7200],
  ['L4T','CA','Mississauga','Ontario','ON',43.7100,-79.6500],
  ['L4L','CA','Vaughan','Ontario','ON',43.8361,-79.5083],
  ['L6A','CA','Vaughan','Ontario','ON',43.8500,-79.5200],
  ['L4B','CA','Richmond Hill','Ontario','ON',43.8828,-79.4403],
  ['L6P','CA','Brampton','Ontario','ON',43.7315,-79.7624],
  ['L6Y','CA','Brampton','Ontario','ON',43.6800,-79.7600],
  ['K1A','CA','Ottawa','Ontario','ON',45.4215,-75.6972],
  ['K1P','CA','Ottawa','Ontario','ON',45.4200,-75.6900],
  ['H3A','CA','Montreal','Quebec','QC',45.5048,-73.5772],
  ['H2X','CA','Montreal','Quebec','QC',45.5100,-73.5700],
  ['H3B','CA','Montreal','Quebec','QC',45.5017,-73.5673],
  ['V6B','CA','Vancouver','British Columbia','BC',49.2827,-123.1207],
  ['V6Z','CA','Vancouver','British Columbia','BC',49.2800,-123.1300],
  ['V5K','CA','Vancouver','British Columbia','BC',49.2700,-123.0700],
  ['T2P','CA','Calgary','Alberta','AB',51.0447,-114.0719],
  ['T2N','CA','Calgary','Alberta','AB',51.0500,-114.1300],
  ['T5J','CA','Edmonton','Alberta','AB',53.5461,-113.4938],
  ['T6E','CA','Edmonton','Alberta','AB',53.5200,-113.4900],
  ['R3C','CA','Winnipeg','Manitoba','MB',49.8951,-97.1384],
  ['B3J','CA','Halifax','Nova Scotia','NS',44.6488,-63.5752],
  ['10001','US','New York','New York','NY',40.7506,-73.9971],
  ['10010','US','New York','New York','NY',40.7400,-73.9800],
  ['10019','US','New York','New York','NY',40.7660,-73.9870],
  ['10003','US','New York','New York','NY',40.7300,-73.9890],
  ['11201','US','Brooklyn','New York','NY',40.6943,-73.9903],
  ['90001','US','Los Angeles','California','CA',33.9731,-118.2479],
  ['90028','US','Los Angeles','California','CA',34.1016,-118.3267],
  ['90210','US','Beverly Hills','California','CA',34.1030,-118.4105],
  ['94102','US','San Francisco','California','CA',37.7793,-122.4193],
  ['94103','US','San Francisco','California','CA',37.7726,-122.4099],
  ['94110','US','San Francisco','California','CA',37.7510,-122.4150],
  ['60601','US','Chicago','Illinois','IL',41.8857,-87.6228],
  ['60611','US','Chicago','Illinois','IL',41.8964,-87.6212],
  ['60607','US','Chicago','Illinois','IL',41.8740,-87.6520],
  ['77001','US','Houston','Texas','TX',29.7589,-95.3677],
  ['77002','US','Houston','Texas','TX',29.7500,-95.3600],
  ['75201','US','Dallas','Texas','TX',32.7831,-96.8067],
  ['75202','US','Dallas','Texas','TX',32.7800,-96.8000],
  ['78701','US','Austin','Texas','TX',30.2672,-97.7431],
  ['33101','US','Miami','Florida','FL',25.7617,-80.1918],
  ['33139','US','Miami Beach','Florida','FL',25.7900,-80.1300],
  ['98101','US','Seattle','Washington','WA',47.6101,-122.3344],
  ['98102','US','Seattle','Washington','WA',47.6300,-122.3200],
  ['02108','US','Boston','Massachusetts','MA',42.3582,-71.0637],
  ['02116','US','Boston','Massachusetts','MA',42.3500,-71.0700],
  ['19103','US','Philadelphia','Pennsylvania','PA',39.9526,-75.1652],
  ['20001','US','Washington','District of Columbia','DC',38.9072,-77.0369],
  ['30303','US','Atlanta','Georgia','GA',33.7490,-84.3880],
  ['80202','US','Denver','Colorado','CO',39.7392,-104.9903],
  ['85001','US','Phoenix','Arizona','AZ',33.4484,-112.0740],
  ['89101','US','Las Vegas','Nevada','NV',36.1716,-115.1391],
  ['97201','US','Portland','Oregon','OR',45.5152,-122.6784],
] as const

const STORE_ANCHORS: Record<string, { lat: number, lng: number, city: string, postal: string, online: boolean }> = {
  'amazon':        { lat: 0, lng: 0, city: '', postal: '', online: true },
  'amazon-ca':     { lat: 0, lng: 0, city: '', postal: '', online: true },
  'walmart':       { lat: 40.7506, lng: -73.9971, city: 'New York', postal: '10001', online: false },
  'target':        { lat: 40.7400, lng: -73.9800, city: 'New York', postal: '10010', online: false },
  'best-buy':      { lat: 40.7500, lng: -73.9900, city: 'New York', postal: '10001', online: false },
  'home-depot':    { lat: 40.7300, lng: -74.0000, city: 'New York', postal: '10001', online: false },
  'nike':          { lat: 40.7660, lng: -73.9870, city: 'New York', postal: '10019', online: false },
  'kohls':         { lat: 41.8857, lng: -87.6228, city: 'Chicago',  postal: '60601', online: false },
  'macys':         { lat: 40.7506, lng: -73.9870, city: 'New York', postal: '10001', online: false },
  'gap':           { lat: 37.7793, lng: -122.4193, city: 'San Francisco', postal: '94102', online: false },
  'walmart-ca':    { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
  'best-buy-ca':   { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
  'home-depot-ca': { lat: 43.8361, lng: -79.5083, city: 'Vaughan', postal: 'L4L', online: false },
  'canadian-tire': { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
  'sport-chek':    { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
  'the-bay':       { lat: 43.6580, lng: -79.3868, city: 'Toronto', postal: 'M5G', online: false },
  'loblaws':       { lat: 43.8561, lng: -79.3370, city: 'Markham', postal: 'L6E', online: false },
  'winners':       { lat: 43.6757, lng: -79.3839, city: 'Toronto', postal: 'M4W', online: false },
  'staples-ca':    { lat: 43.8501, lng: -79.3370, city: 'Markham', postal: 'L3R', online: false },
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const log: any = { steps: {} }

  // STEP 1: Try inserting postal codes — if the table doesn't exist this fails gracefully
  try {
    const rows = POSTAL_CODES.map(([code, country, city, province_state, state_code, latitude, longitude]) => ({
      code, country, city, province_state, state_code, latitude, longitude,
    }))
    const { error, count } = await supabase
      .from('postal_code_locations')
      .upsert(rows, { onConflict: 'code', ignoreDuplicates: true, count: 'exact' })
    log.steps.postal_codes = error ? { error: error.message, hint: error.hint } : { upserted: count ?? rows.length }
  } catch (e: any) {
    log.steps.postal_codes = { error: e?.message || String(e) }
  }

  // STEP 2: Tag retailers with anchor locations
  try {
    let updated = 0
    for (const [slug, anchor] of Object.entries(STORE_ANCHORS)) {
      const payload: any = {
        latitude: anchor.online ? null : anchor.lat,
        longitude: anchor.online ? null : anchor.lng,
        city: anchor.online ? null : anchor.city,
        postal_code: anchor.online ? null : anchor.postal,
        has_physical_stores: !anchor.online,
      }
      const { error } = await supabase.from('retailers').update(payload).eq('slug', slug)
      if (!error) updated++
    }
    log.steps.retailers_tagged = { updated }
  } catch (e: any) {
    log.steps.retailers_tagged = { error: e?.message || String(e) }
  }

  // STEP 3: Tag all deals with their retailer's anchor location
  try {
    const { data: deals } = await supabase
      .from('deals')
      .select('id, retailer_id, retailers(slug)')
      .eq('is_active', true)
    let online = 0, physical = 0, errors = 0
    for (const d of (deals || []) as any[]) {
      const slug = d.retailers?.slug
      const anchor = slug ? STORE_ANCHORS[slug] : null
      if (!anchor || anchor.online) {
        const { error } = await supabase.from('deals').update({
          is_online_only: true,
          store_latitude: null,
          store_longitude: null,
          store_city: null,
          store_postal: null,
        }).eq('id', d.id)
        if (error) errors++; else online++
      } else {
        const { error } = await supabase.from('deals').update({
          is_online_only: false,
          store_latitude: anchor.lat,
          store_longitude: anchor.lng,
          store_city: anchor.city,
          store_postal: anchor.postal,
        }).eq('id', d.id)
        if (error) errors++; else physical++
      }
    }
    log.steps.deals_tagged = { total: deals?.length || 0, online, physical, errors }
  } catch (e: any) {
    log.steps.deals_tagged = { error: e?.message || String(e) }
  }

  log.summary = 'Step 1 setup complete. If postal_codes errored with "relation does not exist", the schema SQL must be run in Supabase first.'
  log.timestamp = new Date().toISOString()
  return NextResponse.json(log)
}
