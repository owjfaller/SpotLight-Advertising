'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import SpaceCard from '@/components/spaces/SpaceCard'
import SpaceMapWrapper from '@/components/spaces/SpaceMapWrapper'
import { AdSpace, AdSpaceMapMarker } from '@/lib/types/database.types'
import { haversineDistance } from '@/lib/utils/haversine'

const SPACE_TYPES = ['Billboard', 'Vehicle', 'Indoor', 'Outdoor', 'Digital', 'Event']

interface SpacesExplorerProps {
  spaces: AdSpace[]
  mapMarkers: AdSpaceMapMarker[]
  searchParams: {
    q?: string
    type?: string
    city?: string
  }
}

function buildUrl(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v)
  }
  const s = p.toString()
  return `/spaces${s ? `?${s}` : ''}`
}

export default function SpacesExplorer({ spaces, mapMarkers, searchParams }: SpacesExplorerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [radiusMiles, setRadiusMiles] = useState(25)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spotlight-favorites')
      if (stored) setFavorites(new Set(JSON.parse(stored)))
    } catch {}
  }, [])

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        localStorage.setItem('spotlight-favorites', JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }

  const userLocation = useMemo<[number, number] | null>(
    () => (userLat !== null && userLng !== null ? [userLat, userLng] : null),
    [userLat, userLng],
  )

  const filteredSpaces = useMemo(() => {
    if (userLat === null || userLng === null) return spaces
    return spaces.filter((s) => {
      if (s.lat === null || s.lng === null) return false
      return haversineDistance(userLat, userLng, s.lat, s.lng) <= radiusMiles
    })
  }, [spaces, userLat, userLng, radiusMiles])

  const filteredMarkers = useMemo(() => {
    if (userLat === null || userLng === null) return mapMarkers
    return mapMarkers.filter((m) =>
      haversineDistance(userLat, userLng, m.lat, m.lng) <= radiusMiles,
    )
  }, [mapMarkers, userLat, userLng, radiusMiles])

  const handleMarkerHover = useCallback((id: string | null) => {
    setHoveredId(id)
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  function handleNearMe() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setGeoLoading(false)
      },
      () => {
        setGeoError('Location access was denied.')
        setGeoLoading(false)
      },
    )
  }

  function clearLocation() {
    setUserLat(null)
    setUserLng(null)
    setGeoError(null)
  }

  const allTypesUrl = buildUrl({ city: searchParams.city, q: searchParams.q })

  // Proximity controls — shared between desktop sidebar and mobile collapsible
  const proximitySection = (
    <div className="space-y-3">
      <button
        onClick={handleNearMe}
        disabled={geoLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-50"
      >
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {geoLoading ? 'Locating…' : userLocation ? 'Update location' : 'Near me'}
      </button>

      {geoError && <p className="text-xs text-red-600">{geoError}</p>}

      {userLocation && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Radius</span>
            <span className="text-xs font-semibold text-[#1877F2]">{radiusMiles} mi</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-full accent-[#1877F2]"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 mi</span>
            <span>100 mi</span>
          </div>
          <button
            onClick={clearLocation}
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
          >
            Clear location filter
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-300 bg-white overflow-hidden">
        <div className="flex-none border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {/* City search */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              City
            </label>
            <form method="GET" action="/spaces" className="flex gap-1.5">
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
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-[#f0f2f5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#1877F2] px-3 py-2 text-white transition-colors hover:bg-blue-700"
                aria-label="Search city"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Space type */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Space type
            </p>
            <div className="flex flex-col gap-0.5">
              <a
                href={allTypesUrl}
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
                  href={buildUrl({ city: searchParams.city, q: searchParams.q, type: t })}
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

          {/* Proximity */}
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Proximity
            </p>
            {proximitySection}
          </div>
        </nav>
      </aside>

      {/* ── Card list column ── */}
      <div
        className={`flex flex-col border-r border-gray-300 bg-white overflow-hidden w-full md:w-80 md:shrink-0 ${
          mobileView === 'map' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header bar */}
        <div className="flex-none border-b border-gray-300 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{filteredSpaces.length}</span>{' '}
              {filteredSpaces.length === 1 ? 'listing' : 'listings'}
              {searchParams.type ? ` · ${searchParams.type}` : ''}
              {searchParams.city ? ` in ${searchParams.city}` : ''}
            </p>

            {/* Mobile controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setShowMobileFilters((v) => !v)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  showMobileFilters || userLocation
                    ? 'border-[#1877F2] text-[#1877F2]'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                Filters{userLocation ? ` · ${radiusMiles}mi` : ''}
              </button>
              <div className="flex overflow-hidden rounded-lg border border-gray-300">
                <button
                  onClick={() => setMobileView('list')}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    mobileView === 'list' ? 'bg-[#1877F2] text-white' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setMobileView('map')}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    mobileView === 'map' ? 'bg-[#1877F2] text-white' : 'text-gray-600'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Mobile proximity + city search (collapsible) */}
          {showMobileFilters && (
            <div className="mt-3 space-y-3 border-t border-gray-200 pt-3 md:hidden">
              <form method="GET" action="/spaces" className="flex gap-1.5">
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
                  placeholder="Search city…"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-[#f0f2f5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-[#1877F2] px-3 py-2 text-white"
                  aria-label="Search city"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                </button>
              </form>
              {proximitySection}
            </div>
          )}
        </div>

        {/* Scrollable card list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSpaces.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-lg font-semibold text-gray-900">No listings found</p>
              <p className="mt-1 text-sm text-gray-500">
                {userLocation
                  ? 'Try increasing the radius or clearing the location filter.'
                  : 'Try adjusting your filters or search.'}
              </p>
            </div>
          ) : (
            filteredSpaces.map((space) => (
              <div key={space.id} id={space.id}>
                <SpaceCard
                  space={space}
                  isHighlighted={hoveredId === space.id}
                  isFavorited={favorites.has(space.id)}
                  onMouseEnter={() => setHoveredId(space.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onToggleFavorite={() => toggleFavorite(space.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Map column ── */}
      <div className={`flex-1 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        <SpaceMapWrapper
          markers={filteredMarkers}
          hoveredId={hoveredId}
          onMarkerHover={handleMarkerHover}
          userLocation={userLocation}
          radiusMiles={radiusMiles}
        />
      </div>
    </div>
  )
}
