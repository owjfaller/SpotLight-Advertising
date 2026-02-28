export const dynamic = 'force-dynamic'

import { getSpaces } from '@/lib/queries/spaces'
import SpacesExplorer from '@/components/spaces/SpacesExplorer'
import { MOCK_SPACES, MOCK_MARKERS } from '@/lib/mock/spaces'

interface SpacesPageProps {
  searchParams: {
    q?: string
    type?: string
    city?: string
  }
}

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  const { spaces, mapMarkers } = hasSupabase
    ? await getSpaces({ q: searchParams.q, type: searchParams.type, city: searchParams.city })
    : {
        spaces: MOCK_SPACES.filter(
          (s) =>
            (!searchParams.type || s.space_type === searchParams.type) &&
            (!searchParams.city || (s.city ?? '').toLowerCase().includes(searchParams.city.toLowerCase())),
        ),
        mapMarkers: MOCK_MARKERS.filter(
          (m) =>
            (!searchParams.type || m.space_type === searchParams.type) &&
            (!searchParams.city || (m.city ?? '').toLowerCase().includes(searchParams.city.toLowerCase())),
        ),
      }

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
