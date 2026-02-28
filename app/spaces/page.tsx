export const dynamic = 'force-dynamic'

import { getSpaces } from '@/lib/queries/spaces'
import SpaceCard from '@/components/spaces/SpaceCard'
import SpaceMapWrapper from '@/components/spaces/SpaceMapWrapper'

interface SpacesPageProps {
  searchParams: {
    q?: string
    type?: string
    city?: string
    view?: string
  }
}

const SPACE_TYPES = ['Billboard', 'Vehicle', 'Indoor', 'Outdoor', 'Digital', 'Event']

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const { spaces, mapMarkers } = await getSpaces({
    q: searchParams.q,
    type: searchParams.type,
    city: searchParams.city,
  })

  const showMap = searchParams.view === 'map'

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* ── Left sidebar ── */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-300 bg-white md:flex flex-col">
          <div className="border-b border-gray-200 p-4">
            <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {/* City filter */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                City
              </label>
              <form method="GET" action="/spaces">
                {searchParams.type && (
                  <input type="hidden" name="type" value={searchParams.type} />
                )}
                {searchParams.q && (
                  <input type="hidden" name="q" value={searchParams.q} />
                )}
                <input
                  name="city"
                  type="text"
                  defaultValue={searchParams.city ?? ''}
                  placeholder="e.g. Chicago"
                  className="w-full rounded-lg border border-gray-300 bg-[#f0f2f5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                />
              </form>
            </div>

            {/* Type filter */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Space type
              </p>
              <div className="flex flex-col gap-0.5">
                <a
                  href="/spaces"
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    !searchParams.type
                      ? 'bg-blue-50 text-[#1877F2]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All types
                </a>
                {SPACE_TYPES.map((t) => (
                  <a
                    key={t}
                    href={`/spaces?type=${t}${searchParams.city ? `&city=${searchParams.city}` : ''}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      searchParams.type === t
                        ? 'bg-blue-50 text-[#1877F2]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* View toggle */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <a
                href={`/spaces?${new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.type ? { type: searchParams.type } : {}), ...(searchParams.city ? { city: searchParams.city } : {}) }).toString()}`}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium ${!showMap ? 'bg-[#1877F2] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </a>
              <a
                href={`/spaces?view=map${searchParams.q ? `&q=${searchParams.q}` : ''}${searchParams.type ? `&type=${searchParams.type}` : ''}${searchParams.city ? `&city=${searchParams.city}` : ''}`}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium ${showMap ? 'bg-[#1877F2] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Map
              </a>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Header bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{spaces.length}</span>{' '}
              {spaces.length === 1 ? 'listing' : 'listings'}
              {searchParams.type ? ` · ${searchParams.type}` : ''}
              {searchParams.city ? ` in ${searchParams.city}` : ''}
            </p>

            {/* Mobile view toggle */}
            <div className="flex md:hidden rounded-lg border border-gray-300 overflow-hidden">
              <a
                href={`/spaces?${new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(searchParams.type ? { type: searchParams.type } : {}), ...(searchParams.city ? { city: searchParams.city } : {}) }).toString()}`}
                className={`px-3 py-1.5 text-xs font-medium ${!showMap ? 'bg-[#1877F2] text-white' : 'text-gray-600'}`}
              >
                Grid
              </a>
              <a
                href={`/spaces?view=map${searchParams.q ? `&q=${searchParams.q}` : ''}${searchParams.type ? `&type=${searchParams.type}` : ''}${searchParams.city ? `&city=${searchParams.city}` : ''}`}
                className={`px-3 py-1.5 text-xs font-medium ${showMap ? 'bg-[#1877F2] text-white' : 'text-gray-600'}`}
              >
                Map
              </a>
            </div>
          </div>

          {showMap ? (
            /* Map view */
            <div className="relative h-[calc(100vh-56px-53px)]">
              <div className="absolute inset-0">
                <SpaceMapWrapper markers={mapMarkers} />
              </div>
            </div>
          ) : (
            /* Grid view */
            <div className="p-4">
              {spaces.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <span className="mb-4 text-5xl">🔍</span>
                  <p className="text-lg font-semibold text-gray-900">No listings found</p>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {spaces.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
