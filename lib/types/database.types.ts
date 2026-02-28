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
  space_type: string
  status: 'draft' | 'published' | 'archived'
  price_cents: number
  city: string
  address: string | null
  lat: number | null
  lng: number | null
  created_at: string
  updated_at: string
}

export interface AdSpaceMapMarker {
  id: string
  title: string
  space_type: string
  price_cents: number
  city: string
  lat: number
  lng: number
}
