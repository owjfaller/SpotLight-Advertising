import { createClient } from '../supabase/server'
import { SpaceType } from '../types/database.types'
import { getCoordinates } from '../utils/geocode'
import { haversineDistance } from '../utils/haversine'

export interface AdSpaceFilters {
  low_price?: number;
  high_price?: number;
  type?: SpaceType;
  radius?: number;
  user_lat?: number;
  user_lng?: number;
  start_date?: string;
  end_date?: string;
}

export async function addAdSpace(params: {
  title: string
  owner_id: string
  address: string
  city: string
  start_date: string
  end_date: string
  price: number    // dollars
  space_type: SpaceType
  description?: string
  image_url?: string
}): Promise<{ id: string | null; error: string | null }> {
  const { title, owner_id, address, city, start_date, end_date, price, space_type, description, image_url } = params

  const coords = await getCoordinates(address)
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ad_spaces')
    .insert({
      title,
      owner_id,
      address,
      city,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      start_date,
      end_date,
      price_cents: Math.round(price * 100),
      space_type,
      description: description ?? null,
      image_url: image_url ?? null,
      status: 'published'
    })
    .select('id')
    .single()

  if (error) return { id: null, error: error.message }
  return { id: data.id, error: null }
}

export async function getFilteredAdSpaces(
  filters: AdSpaceFilters
): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = createClient()
  let query = supabase.from('ad_spaces').select('*').eq('status', 'published')

  const lowPrice = filters.low_price ?? 0
  query = query.gte('price_cents', Math.round(lowPrice * 100))

  if (filters.high_price !== undefined && filters.high_price !== null) {
    query = query.lte('price_cents', Math.round(filters.high_price * 100))
  }

  if (filters.type) {
    query = query.eq('space_type', filters.type)
  }

  if (filters.start_date) {
    query = query.lte('start_date', filters.start_date)
  }
  if (filters.end_date) {
    query = query.gte('end_date', filters.end_date)
  }

  const { data, error } = await query

  if (error) return { data: null, error: error.message }
  if (!data) return { data: [], error: null }

  let results = data

  if (filters.radius && filters.user_lat !== undefined && filters.user_lng !== undefined) {
    results = data.filter((item) => {
      if (item.lat === null || item.lng === null) return false
      const distance = haversineDistance(
        filters.user_lat!,
        filters.user_lng!,
        item.lat,
        item.lng
      )
      return distance <= filters.radius!
    })
  }

  return { data: results, error: null }
}
