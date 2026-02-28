import { createClient } from '../supabase/server'
import { AdSpace, AdSpaceMapMarker } from '../types/database.types'

interface GetSpacesOptions {
  q?: string
  type?: string
  city?: string
}

interface GetSpacesResult {
  spaces: AdSpace[]
  mapMarkers: AdSpaceMapMarker[]
}

export async function getSpaces(options: GetSpacesOptions = {}): Promise<GetSpacesResult> {
  const supabase = createClient()

  let query = supabase
    .from('ad_spaces')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Search logic
  if (options.q) {
    // Basic text search on title and description
    query = query.or(`title.ilike.%${options.q}%,description.ilike.%${options.q}%`)
  }

  if (options.type) {
    query = query.eq('space_type', options.type)
  }

  if (options.city) {
    query = query.ilike('city', `%${options.city}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('getSpaces error:', error)
    return { spaces: [], mapMarkers: [] }
  }

  const spaces = (data as AdSpace[]) ?? []

  const mapMarkers: AdSpaceMapMarker[] = spaces
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({
      id: s.id,
      title: s.title,
      space_type: s.space_type,
      price_cents: s.price_cents,
      city: s.city,
      lat: s.lat as number,
      lng: s.lng as number,
    }))

  return { spaces, mapMarkers }
}

export async function getSpaceById(id: string): Promise<AdSpace | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ad_spaces')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  return data as AdSpace
}
