import { createClient } from '../supabase/server'
import { createUUID } from '../utils/uuid'
import { getCoordinates } from '../utils/geocode'

export type SpaceType = 'Billboard' | 'Vehicle' | 'Indoor' | 'Outdoor' | 'Digital' | 'Event' | 'Other'

export interface Duration {
  start_date: string // YYYY-MM-DD
  end_date: string   // YYYY-MM-DD
}

export interface AddListingParams {
  title: string
  username: string
  location: string
  duration: Duration
  price: number    // dollars (e.g. 1500 = $1,500)
  type: SpaceType
}

export async function addListing(
  params: AddListingParams
): Promise<{ id: string | null; error: string | null }> {
  const { title, username, location, duration, price, type } = params

  const id = createUUID(title)
  const coords = await getCoordinates(location)

  const supabase = createClient()

  const { data, error } = await supabase
    .from('listings')
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

export async function getListingByTitleAndOwner(
  title: string,
  username: string
): Promise<{ id: string | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('id')
    .eq('title', title)
    .eq('owner', username)
    .single()

  if (error) return { id: null, error: error.message }
  return { id: data.id, error: null }
}
