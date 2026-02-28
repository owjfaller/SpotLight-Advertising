import { createClient } from '../supabase/server'
import { createUUID } from '../utils/uuid'
import { getCoordinates } from '../utils/geocode'
import { haversineDistance } from '../utils/haversine'

export type SpaceType = 'Billboard' | 'Vehicle' | 'Indoor' | 'Outdoor' | 'Digital' | 'Event' | 'Other'

export interface Duration {
  start_date: string // YYYY-MM-DD
  end_date: string   // YYYY-MM-DD
}

export interface AddAdSpaceParams {
  title: string
  username: string
  location: string
  duration: Duration
  price: number    // dollars (e.g. 1500 = $1,500)
  type: SpaceType
}

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

export async function addAdSpace(
  params: AddAdSpaceParams
): Promise<{ id: string | null; error: string | null }> {
  const { title, username, location, duration, price, type } = params

  const id = createUUID()
  const coords = await getCoordinates(location)

  const supabase = createClient()

  const { data, error } = await supabase
    .from('ad_spaces')
    .insert({
      id,
      title,
      owner: username,
      location_address: location,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      start_date: duration.start_date,
      end_date: duration.end_date,
      price_cents: Math.round(price * 100),
      type,
    })
    .select('id')
    .single()

  if (error) return { id: null, error: error.message }
  return { id: data.id, error: null }
}

export async function getAdSpaceByTitleAndOwner(
  title: string,
  username: string
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ad_spaces')
    .select('id')
    .eq('title', title)
    .eq('owner', username)
    .single()

  if (error) return { id: null, error: error.message }
  return { id: data.id, error: null }
}

export async function getFilteredAdSpaces(
  filters: AdSpaceFilters
): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = createClient()
  let query = supabase.from('ad_spaces').select('*')

  // Price "between" logic: defaults low_price to 0 if not provided
  const lowPrice = filters.low_price ?? 0
  query = query.gte('price_cents', Math.round(lowPrice * 100))

  if (filters.high_price !== undefined && filters.high_price !== null) {
    query = query.lte('price_cents', Math.round(filters.high_price * 100))
  }

  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  // Date filtering logic as requested:
  // "start date being any date equal to or less than the start date"
  if (filters.start_date) {
    query = query.lte('start_date', filters.start_date)
  }
  // "end date being anything earlier or equal to the given end date"
  if (filters.end_date) {
    query = query.gte('end_date', filters.end_date)
  }

  const { data, error } = await query

  if (error) return { data: null, error: error.message }
  if (!data) return { data: [], error: null }

  let results = data

  // Handle radius filter in TypeScript
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
