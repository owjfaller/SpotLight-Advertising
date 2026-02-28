export const dynamic = 'force-dynamic'

import { getSpaces } from '@/lib/queries/spaces'
import SpacesExplorer from '@/components/spaces/SpacesExplorer'

interface SpacesPageProps {
  searchParams: {
    q?: string
    type?: string
    city?: string
  }
}

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const { spaces, mapMarkers } = await getSpaces({
    q: searchParams.q,
    type: searchParams.type,
    city: searchParams.city,
  })

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
