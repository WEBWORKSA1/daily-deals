export interface PostalRecord {
  code: string
  country: 'US' | 'CA'
  city: string
  province_state: string
  state_code: string
  latitude: number
  longitude: number
}

const ROWS: PostalRecord[] = [
  { code:'L6E', country:'CA', city:'Markham', province_state:'Ontario', state_code:'ON', latitude:43.8561, longitude:-79.3370 },
  { code:'L3R', country:'CA', city:'Markham', province_state:'Ontario', state_code:'ON', latitude:43.8501, longitude:-79.3370 },
  { code:'L3P', country:'CA', city:'Markham', province_state:'Ontario', state_code:'ON', latitude:43.8800, longitude:-79.2700 },
  { code:'M5V', country:'CA', city:'Toronto', province_state:'Ontario', state_code:'ON', latitude:43.6426, longitude:-79.3871 },
  { code:'M5H', country:'CA', city:'Toronto', province_state:'Ontario', state_code:'ON', latitude:43.6500, longitude:-79.3800 },
  { code:'M4W', country:'CA', city:'Toronto', province_state:'Ontario', state_code:'ON', latitude:43.6757, longitude:-79.3839 },
  { code:'M5G', country:'CA', city:'Toronto', province_state:'Ontario', state_code:'ON', latitude:43.6580, longitude:-79.3868 },
  { code:'M5J', country:'CA', city:'Toronto', province_state:'Ontario', state_code:'ON', latitude:43.6440, longitude:-79.3800 },
  { code:'L4Y', country:'CA', city:'Mississauga', province_state:'Ontario', state_code:'ON', latitude:43.5890, longitude:-79.6441 },
  { code:'L5M', country:'CA', city:'Mississauga', province_state:'Ontario', state_code:'ON', latitude:43.5800, longitude:-79.7200 },
  { code:'L4T', country:'CA', city:'Mississauga', province_state:'Ontario', state_code:'ON', latitude:43.7100, longitude:-79.6500 },
  { code:'L4L', country:'CA', city:'Vaughan', province_state:'Ontario', state_code:'ON', latitude:43.8361, longitude:-79.5083 },
  { code:'L6A', country:'CA', city:'Vaughan', province_state:'Ontario', state_code:'ON', latitude:43.8500, longitude:-79.5200 },
  { code:'L4B', country:'CA', city:'Richmond Hill', province_state:'Ontario', state_code:'ON', latitude:43.8828, longitude:-79.4403 },
  { code:'L6P', country:'CA', city:'Brampton', province_state:'Ontario', state_code:'ON', latitude:43.7315, longitude:-79.7624 },
  { code:'L6Y', country:'CA', city:'Brampton', province_state:'Ontario', state_code:'ON', latitude:43.6800, longitude:-79.7600 },
  { code:'K1A', country:'CA', city:'Ottawa', province_state:'Ontario', state_code:'ON', latitude:45.4215, longitude:-75.6972 },
  { code:'K1P', country:'CA', city:'Ottawa', province_state:'Ontario', state_code:'ON', latitude:45.4200, longitude:-75.6900 },
  { code:'H3A', country:'CA', city:'Montreal', province_state:'Quebec', state_code:'QC', latitude:45.5048, longitude:-73.5772 },
  { code:'H2X', country:'CA', city:'Montreal', province_state:'Quebec', state_code:'QC', latitude:45.5100, longitude:-73.5700 },
  { code:'H3B', country:'CA', city:'Montreal', province_state:'Quebec', state_code:'QC', latitude:45.5017, longitude:-73.5673 },
  { code:'V6B', country:'CA', city:'Vancouver', province_state:'British Columbia', state_code:'BC', latitude:49.2827, longitude:-123.1207 },
  { code:'V6Z', country:'CA', city:'Vancouver', province_state:'British Columbia', state_code:'BC', latitude:49.2800, longitude:-123.1300 },
  { code:'V5K', country:'CA', city:'Vancouver', province_state:'British Columbia', state_code:'BC', latitude:49.2700, longitude:-123.0700 },
  { code:'T2P', country:'CA', city:'Calgary', province_state:'Alberta', state_code:'AB', latitude:51.0447, longitude:-114.0719 },
  { code:'T2N', country:'CA', city:'Calgary', province_state:'Alberta', state_code:'AB', latitude:51.0500, longitude:-114.1300 },
  { code:'T5J', country:'CA', city:'Edmonton', province_state:'Alberta', state_code:'AB', latitude:53.5461, longitude:-113.4938 },
  { code:'T6E', country:'CA', city:'Edmonton', province_state:'Alberta', state_code:'AB', latitude:53.5200, longitude:-113.4900 },
  { code:'R3C', country:'CA', city:'Winnipeg', province_state:'Manitoba', state_code:'MB', latitude:49.8951, longitude:-97.1384 },
  { code:'B3J', country:'CA', city:'Halifax', province_state:'Nova Scotia', state_code:'NS', latitude:44.6488, longitude:-63.5752 },
  { code:'10001', country:'US', city:'New York', province_state:'New York', state_code:'NY', latitude:40.7506, longitude:-73.9971 },
  { code:'10010', country:'US', city:'New York', province_state:'New York', state_code:'NY', latitude:40.7400, longitude:-73.9800 },
  { code:'10019', country:'US', city:'New York', province_state:'New York', state_code:'NY', latitude:40.7660, longitude:-73.9870 },
  { code:'10003', country:'US', city:'New York', province_state:'New York', state_code:'NY', latitude:40.7300, longitude:-73.9890 },
  { code:'11201', country:'US', city:'Brooklyn', province_state:'New York', state_code:'NY', latitude:40.6943, longitude:-73.9903 },
  { code:'90001', country:'US', city:'Los Angeles', province_state:'California', state_code:'CA', latitude:33.9731, longitude:-118.2479 },
  { code:'90028', country:'US', city:'Los Angeles', province_state:'California', state_code:'CA', latitude:34.1016, longitude:-118.3267 },
  { code:'90210', country:'US', city:'Beverly Hills', province_state:'California', state_code:'CA', latitude:34.1030, longitude:-118.4105 },
  { code:'94102', country:'US', city:'San Francisco', province_state:'California', state_code:'CA', latitude:37.7793, longitude:-122.4193 },
  { code:'94103', country:'US', city:'San Francisco', province_state:'California', state_code:'CA', latitude:37.7726, longitude:-122.4099 },
  { code:'94110', country:'US', city:'San Francisco', province_state:'California', state_code:'CA', latitude:37.7510, longitude:-122.4150 },
  { code:'60601', country:'US', city:'Chicago', province_state:'Illinois', state_code:'IL', latitude:41.8857, longitude:-87.6228 },
  { code:'60611', country:'US', city:'Chicago', province_state:'Illinois', state_code:'IL', latitude:41.8964, longitude:-87.6212 },
  { code:'60607', country:'US', city:'Chicago', province_state:'Illinois', state_code:'IL', latitude:41.8740, longitude:-87.6520 },
  { code:'77001', country:'US', city:'Houston', province_state:'Texas', state_code:'TX', latitude:29.7589, longitude:-95.3677 },
  { code:'77002', country:'US', city:'Houston', province_state:'Texas', state_code:'TX', latitude:29.7500, longitude:-95.3600 },
  { code:'75201', country:'US', city:'Dallas', province_state:'Texas', state_code:'TX', latitude:32.7831, longitude:-96.8067 },
  { code:'75202', country:'US', city:'Dallas', province_state:'Texas', state_code:'TX', latitude:32.7800, longitude:-96.8000 },
  { code:'78701', country:'US', city:'Austin', province_state:'Texas', state_code:'TX', latitude:30.2672, longitude:-97.7431 },
  { code:'33101', country:'US', city:'Miami', province_state:'Florida', state_code:'FL', latitude:25.7617, longitude:-80.1918 },
  { code:'33139', country:'US', city:'Miami Beach', province_state:'Florida', state_code:'FL', latitude:25.7900, longitude:-80.1300 },
  { code:'98101', country:'US', city:'Seattle', province_state:'Washington', state_code:'WA', latitude:47.6101, longitude:-122.3344 },
  { code:'98102', country:'US', city:'Seattle', province_state:'Washington', state_code:'WA', latitude:47.6300, longitude:-122.3200 },
  { code:'02108', country:'US', city:'Boston', province_state:'Massachusetts', state_code:'MA', latitude:42.3582, longitude:-71.0637 },
  { code:'02116', country:'US', city:'Boston', province_state:'Massachusetts', state_code:'MA', latitude:42.3500, longitude:-71.0700 },
  { code:'19103', country:'US', city:'Philadelphia', province_state:'Pennsylvania', state_code:'PA', latitude:39.9526, longitude:-75.1652 },
  { code:'20001', country:'US', city:'Washington', province_state:'District of Columbia', state_code:'DC', latitude:38.9072, longitude:-77.0369 },
  { code:'30303', country:'US', city:'Atlanta', province_state:'Georgia', state_code:'GA', latitude:33.7490, longitude:-84.3880 },
  { code:'80202', country:'US', city:'Denver', province_state:'Colorado', state_code:'CO', latitude:39.7392, longitude:-104.9903 },
  { code:'85001', country:'US', city:'Phoenix', province_state:'Arizona', state_code:'AZ', latitude:33.4484, longitude:-112.0740 },
  { code:'89101', country:'US', city:'Las Vegas', province_state:'Nevada', state_code:'NV', latitude:36.1716, longitude:-115.1391 },
  { code:'97201', country:'US', city:'Portland', province_state:'Oregon', state_code:'OR', latitude:45.5152, longitude:-122.6784 },
]

const MAP = new Map(ROWS.map(r => [r.code, r]))

export function lookupPostal(code: string): PostalRecord | null {
  if (!code) return null
  const clean = code.toUpperCase().replace(/\s/g, '')
  // Canadian FSA = first 3 chars
  const isCA = /^[A-Z]\d[A-Z]/.test(clean)
  const key = isCA ? clean.substring(0, 3) : clean
  return MAP.get(key) || null
}

export function allPostals(): PostalRecord[] { return ROWS }
