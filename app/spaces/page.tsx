export const dynamic = 'force-dynamic'

import { getSpaces } from '@/lib/queries/spaces'
import SpacesExplorer from '@/components/spaces/SpacesExplorer'
import { AdSpace, AdSpaceMapMarker } from '@/lib/types/database.types'

interface SpacesPageProps {
  searchParams: {
    q?: string
    type?: string
    city?: string
  }
}

const MOCK_SPACES: AdSpace[] = [
  { id: '1', owner_id: '', title: 'Downtown Billboard — Times Square', description: null, space_type: 'Billboard', status: 'published', price_cents: 150000, city: 'New York', address: null, lat: 40.758, lng: -73.9855, created_at: '', updated_at: '' },
  { id: '2', owner_id: '', title: 'Wrapped Delivery Van', description: null, space_type: 'Vehicle', status: 'published', price_cents: 45000, city: 'Chicago', address: null, lat: 41.8827, lng: -87.6233, created_at: '', updated_at: '' },
  { id: '3', owner_id: '', title: 'Airport Terminal Screen', description: null, space_type: 'Digital', status: 'published', price_cents: 90000, city: 'Los Angeles', address: null, lat: 33.9425, lng: -118.408, created_at: '', updated_at: '' },
  { id: '4', owner_id: '', title: 'Rooftop Mural Wall', description: null, space_type: 'Outdoor', status: 'published', price_cents: 60000, city: 'Austin', address: null, lat: 30.2672, lng: -97.7431, created_at: '', updated_at: '' },
  { id: '5', owner_id: '', title: 'Mall Atrium Display', description: null, space_type: 'Indoor', status: 'published', price_cents: 35000, city: 'Miami', address: null, lat: 25.7617, lng: -80.1918, created_at: '', updated_at: '' },
  { id: '6', owner_id: '', title: 'Festival Grounds Banner', description: null, space_type: 'Event', status: 'published', price_cents: 25000, city: 'Nashville', address: null, lat: 36.1627, lng: -86.7816, created_at: '', updated_at: '' },
]

const MOCK_MARKERS: AdSpaceMapMarker[] = MOCK_SPACES.map((s) => ({
  id: s.id, title: s.title, space_type: s.space_type, price_cents: s.price_cents,
  city: s.city, lat: s.lat as number, lng: s.lng as number,
}))

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  const { spaces, mapMarkers } = hasSupabase
    ? await getSpaces({ q: searchParams.q, type: searchParams.type, city: searchParams.city })
    : { spaces: MOCK_SPACES, mapMarkers: MOCK_MARKERS }

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <SpacesExplorer spaces={spaces} mapMarkers={mapMarkers} searchParams={searchParams} />
    </>
  )
}
