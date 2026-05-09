export type Country = 'US' | 'CA' | 'BOTH'
export type DealType = 'flash' | 'daily' | 'clearance' | 'coupon'
// All affiliate networks we may route through. 'direct' = no specific network
// (will be wrapped via Skimlinks). 'amazon' bypasses Skimlinks (Amazon disallows mixing).
export type AffiliateNet =
  | 'amazon'
  | 'cj'
  | 'impact'
  | 'shareasale'
  | 'awin'
  | 'rakuten'
  | 'skimlinks'
  | 'direct'

export interface Retailer {
  id: number
  name: string
  slug: string
  logo_url: string | null
  website_url: string
  country: Country
  category: string
  affiliate_net: AffiliateNet
  brand_color: string
  is_active: boolean
  latitude?: number | null
  longitude?: number | null
  postal_code?: string | null
  city?: string | null
  has_physical_stores?: boolean
}

export interface Deal {
  id: number
  title: string
  description: string | null
  original_price: number | null
  deal_price: number
  discount_percent: number | null
  retailer_id: number
  retailer_name?: string
  retailer_slug?: string
  retailer_brand_color?: string
  affiliate_net?: AffiliateNet
  category: string
  image_url: string | null
  affiliate_url: string
  coupon_code: string | null
  is_online: boolean
  is_national: boolean
  is_featured: boolean
  country: Country
  deal_type: DealType
  location_region: string | null
  expires_at: string | null
  click_count: number
  created_at: string
  is_online_only?: boolean
  store_latitude?: number | null
  store_longitude?: number | null
  store_city?: string | null
  store_postal?: string | null
  distance_km?: number
  hotness_score?: number
  hotness_updated_at?: string
  is_editors_choice?: boolean
  is_verified?: boolean
  view_count?: number
  save_count?: number
}

export interface Location {
  id: number
  slug: string
  city: string
  state_province: string
  state_code: string
  country: 'US' | 'CA'
  latitude: number
  longitude: number
}

export interface UserLocation {
  city: string
  stateProvince: string
  stateCode: string
  postalCode: string
  country: 'US' | 'CA'
  isDetected: boolean
  latitude?: number
  longitude?: number
}
