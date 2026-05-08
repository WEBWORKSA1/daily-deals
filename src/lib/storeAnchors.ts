// Maps retailer slug → primary store anchor location.
// This is hardcoded so we don't need a schema change to deals/retailers tables.
// Step 1 uses these to compute distance from user's postal code to nearest store.

export interface StoreAnchor {
  lat: number
  lng: number
  city: string
  state_code: string
  postal: string
  online: boolean  // true = online-only retailer (no physical stores)
}

export const STORE_ANCHORS: Record<string, StoreAnchor> = {
  // ONLINE-ONLY RETAILERS
  'amazon':        { lat:0,       lng:0,        city:'',           state_code:'',   postal:'',      online:true  },
  'amazon-ca':     { lat:0,       lng:0,        city:'',           state_code:'',   postal:'',      online:true  },

  // US PHYSICAL STORES — anchored at NYC flagship locations
  'walmart':       { lat:40.7506, lng:-73.9971, city:'New York',   state_code:'NY', postal:'10001', online:false },
  'target':        { lat:40.7400, lng:-73.9800, city:'New York',   state_code:'NY', postal:'10010', online:false },
  'best-buy':      { lat:40.7500, lng:-73.9900, city:'New York',   state_code:'NY', postal:'10001', online:false },
  'home-depot':    { lat:40.7300, lng:-74.0000, city:'New York',   state_code:'NY', postal:'10001', online:false },
  'nike':          { lat:40.7660, lng:-73.9870, city:'New York',   state_code:'NY', postal:'10019', online:false },
  'kohls':         { lat:41.8857, lng:-87.6228, city:'Chicago',    state_code:'IL', postal:'60601', online:false },
  'macys':         { lat:40.7506, lng:-73.9870, city:'New York',   state_code:'NY', postal:'10001', online:false },
  'gap':           { lat:37.7793, lng:-122.4193, city:'San Francisco', state_code:'CA', postal:'94102', online:false },

  // CANADA PHYSICAL STORES — anchored in/near Markham (your area) and Toronto
  'walmart-ca':    { lat:43.8561, lng:-79.3370, city:'Markham',    state_code:'ON', postal:'L6E',   online:false },
  'best-buy-ca':   { lat:43.8561, lng:-79.3370, city:'Markham',    state_code:'ON', postal:'L6E',   online:false },
  'home-depot-ca': { lat:43.8361, lng:-79.5083, city:'Vaughan',    state_code:'ON', postal:'L4L',   online:false },
  'canadian-tire': { lat:43.8561, lng:-79.3370, city:'Markham',    state_code:'ON', postal:'L6E',   online:false },
  'sport-chek':    { lat:43.8561, lng:-79.3370, city:'Markham',    state_code:'ON', postal:'L6E',   online:false },
  'the-bay':       { lat:43.6580, lng:-79.3868, city:'Toronto',    state_code:'ON', postal:'M5G',   online:false },
  'loblaws':       { lat:43.8561, lng:-79.3370, city:'Markham',    state_code:'ON', postal:'L6E',   online:false },
  'winners':       { lat:43.6757, lng:-79.3839, city:'Toronto',    state_code:'ON', postal:'M4W',   online:false },
  'staples-ca':    { lat:43.8501, lng:-79.3370, city:'Markham',    state_code:'ON', postal:'L3R',   online:false },
}

export function getAnchor(retailerSlug: string | undefined | null): StoreAnchor | null {
  if (!retailerSlug) return null
  return STORE_ANCHORS[retailerSlug] || null
}

// Haversine distance in km
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
