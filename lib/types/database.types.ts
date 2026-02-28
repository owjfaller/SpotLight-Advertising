export type SpaceType = 'Billboard' | 'Vehicle' | 'Indoor' | 'Outdoor' | 'Digital' | 'Event' | 'Other'
export type AdSpaceStatus = 'draft' | 'published' | 'archived'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  can_be_owner: boolean
  can_be_advertiser: boolean
  created_at: string
  updated_at: string
}

export interface AdSpace {
  id: string
  owner_id: string
  title: string
  description: string | null
  space_type: SpaceType
  status: AdSpaceStatus
  price_cents: number
  city: string | null
  address: string | null
  lat: number | null
  lng: number | null
  image_url: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface AdSpaceMapMarker {
  id: string
  title: string
  space_type: SpaceType
  price_cents: number
  city: string | null
  lat: number
  lng: number
}

export interface AdSpaceInterest {
  ad_space_id: string
  user_id: string
  created_at: string
}

export interface Review {
  id: string
  ad_space_id: string
  reviewer_id: string
  rating: number
  title: string
  body: string
  created_at: string
}
