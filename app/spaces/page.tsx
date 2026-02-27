export const dynamic = 'force-dynamic'

import { getSpaces } from '@/lib/queries/spaces'
import SpaceCard from '@/components/spaces/SpaceCard'
import SpaceMapWrapper from '@/components/spaces/SpaceMapWrapper'

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
      {/* Leaflet CSS — must load before JS hydrates */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left: scrollable card list */}
        <aside className="w-full md:w-[420px] shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <h1 className="mb-4 text-xl font-bold text-gray-900">
              Ad Spaces{' '}
              <span className="text-sm font-normal text-gray-500">({spaces.length})</span>
            </h1>

            {spaces.length === 0 ? (
              <p className="text-sm text-gray-500">No spaces found. Try adjusting your filters.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {spaces.map((space) => (
                  <li key={space.id}>
                    <SpaceCard space={space} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Right: sticky map */}
        <div className="relative hidden md:block flex-1">
          <div className="absolute inset-0">
            <SpaceMapWrapper markers={mapMarkers} />
          </div>
        </div>
      </div>
    </>
  )
}
