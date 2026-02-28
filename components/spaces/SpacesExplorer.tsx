'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import SpaceCard from '@/components/spaces/SpaceCard'
import SpaceMapWrapper from '@/components/spaces/SpaceMapWrapper'
import { AdSpace, AdSpaceMapMarker } from '@/lib/types/database.types'
import { haversineDistance } from '@/lib/utils/haversine'

const SPACE_TYPES   = ['Billboard', 'Vehicle', 'Indoor', 'Outdoor', 'Digital', 'Event']
const PRICE_MAX     = 5000   // slider ceiling — $5,000 /mo
const today         = new Date().toISOString().split('T')[0]

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
  // ── State ──────────────────────────────────────────────────────────────────
  const [hoveredId,          setHoveredId]          = useState<string | null>(null)
  const [userLat,            setUserLat]            = useState<number | null>(null)
  const [userLng,            setUserLng]            = useState<number | null>(null)
  const [radiusMiles,        setRadiusMiles]        = useState(25)
  const [geoLoading,         setGeoLoading]         = useState(false)
  const [geoError,           setGeoError]           = useState<string | null>(null)
  const [mobileView,         setMobileView]         = useState<'list' | 'map'>('list')
  const [showMobileFilters,  setShowMobileFilters]  = useState(false)
  const [favorites,          setFavorites]          = useState<Set<string>>(new Set())
  const [minPriceDollars,    setMinPriceDollars]    = useState(0)
  const [maxPriceDollars,    setMaxPriceDollars]    = useState(PRICE_MAX)
  const [startDate,          setStartDate]          = useState('')
  const [endDate,            setEndDate]            = useState('')

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
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      try {
        localStorage.setItem('spotlight-favorites', JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const userLocation = useMemo<[number, number] | null>(
    () => (userLat !== null && userLng !== null ? [userLat, userLng] : null),
    [userLat, userLng],
  )

  const filteredSpaces = useMemo(() => {
    return spaces.filter((s) => {
      const priceDollars = s.price_cents / 100
      if (priceDollars < minPriceDollars || priceDollars > maxPriceDollars) return false
      if (userLat !== null && userLng !== null) {
        if (s.lat === null || s.lng === null) return false
        return haversineDistance(userLat, userLng, s.lat, s.lng) <= radiusMiles
      }
      return true
    })
  }, [spaces, userLat, userLng, radiusMiles, minPriceDollars, maxPriceDollars])

  const filteredMarkers = useMemo(() => {
    return mapMarkers.filter((m) => {
      const priceDollars = m.price_cents / 100
      if (priceDollars < minPriceDollars || priceDollars > maxPriceDollars) return false
      if (userLat !== null && userLng !== null) {
        return haversineDistance(userLat, userLng, m.lat, m.lng) <= radiusMiles
      }
      return true
    })
  }, [mapMarkers, userLat, userLng, radiusMiles, minPriceDollars, maxPriceDollars])

  // ── Handlers ───────────────────────────────────────────────────────────────
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

  // ── URL helpers ────────────────────────────────────────────────────────────
  const allTypesUrl = buildUrl({ city: searchParams.city, q: searchParams.q })

  // ── Reusable sidebar sections ──────────────────────────────────────────────

  const priceRangeSection = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Min</span>
        <span className="text-xs font-semibold text-[#1877F2]">
          ${minPriceDollars.toLocaleString()}/mo
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={PRICE_MAX}
        step={50}
        value={minPriceDollars}
        onChange={(e) => {
          const v = Number(e.target.value)
          setMinPriceDollars(Math.min(v, maxPriceDollars))
        }}
        className="w-full accent-[#1877F2]"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Max</span>
        <span className="text-xs font-semibold text-[#1877F2]">
          {maxPriceDollars >= PRICE_MAX ? `$${PRICE_MAX.toLocaleString()}+` : `$${maxPriceDollars.toLocaleString()}`}/mo
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={PRICE_MAX}
        step={50}
        value={maxPriceDollars}
        onChange={(e) => {
          const v = Number(e.target.value)
          setMaxPriceDollars(Math.max(v, minPriceDollars))
        }}
        className="w-full accent-[#1877F2]"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>$0</span>
        <span>${PRICE_MAX.toLocaleString()}+</span>
      </div>
    </div>
  )

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
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

  const campaignDatesSection = (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs text-gray-400">Start date</label>
        <input
          type="date"
          value={startDate}
          min={today}
          onChange={(e) => {
            setStartDate(e.target.value)
            if (endDate && e.target.value > endDate) setEndDate('')
          }}
          className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">End date</label>
        <input
          type="date"
          value={endDate}
          min={startDate || today}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
        />
      </div>
      {startDate && endDate && (
        <p className="text-xs font-semibold text-[#1877F2]">
          {startDate} → {endDate}
        </p>
      )}
      {(startDate || endDate) && (
        <button
          onClick={() => { setStartDate(''); setEndDate('') }}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
        >
          Clear dates
        </button>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full h-[calc(100vh-56px)] overflow-hidden bg-white">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-gray-200 overflow-hidden">
        <div className="flex-none p-4">
          <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">

          {/* City search */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              City
            </label>
            <form method="GET" action="/spaces" className="flex gap-1.5">
              {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
              {searchParams.q    && <input type="hidden" name="q"    value={searchParams.q}    />}
              <input
                name="city"
                type="text"
                defaultValue={searchParams.city ?? ''}
                placeholder="e.g. Chicago"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-[#f0f2f5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              <button
                type="submit"
                aria-label="Search city"
                className="shrink-0 rounded-lg bg-[#1877F2] px-3 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Space type */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Space type
            </p>
            <div className="flex flex-col gap-0.5">
              <a
                href={allTypesUrl}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  !searchParams.type ? 'bg-blue-50 text-[#1877F2]' : 'text-gray-700 hover:bg-gray-100'
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

          {/* Price range */}
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Price range
            </p>
            {priceRangeSection}
          </div>

          {/* Proximity */}
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Proximity
            </p>
            {proximitySection}
          </div>

          {/* Campaign dates */}
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Campaign dates
            </p>
            {campaignDatesSection}
          </div>

        </nav>
      </aside>

      {/* ── Card list column ── */}
      <div
        className={`flex flex-col bg-white border-r border-gray-200 overflow-hidden w-full md:w-80 md:shrink-0 ${
          mobileView === 'map' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header bar */}
        <div className="flex-none bg-white px-4 py-3">
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
                  showMobileFilters || userLocation || minPriceDollars > 0 || maxPriceDollars < PRICE_MAX
                    ? 'border-[#1877F2] text-[#1877F2]'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                Filters
              </button>
              <div className="flex overflow-hidden rounded-lg border border-gray-300">
                <button
                  onClick={() => setMobileView('list')}
                  className={`px-3 py-1.5 text-xs font-medium ${mobileView === 'list' ? 'bg-[#1877F2] text-white' : 'text-gray-600'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setMobileView('map')}
                  className={`px-3 py-1.5 text-xs font-medium ${mobileView === 'map' ? 'bg-[#1877F2] text-white' : 'text-gray-600'}`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filters (collapsible) */}
          {showMobileFilters && (
            <div className="mt-3 space-y-4 border-t border-gray-200 pt-3 md:hidden">
              {/* City */}
              <form method="GET" action="/spaces" className="flex gap-1.5">
                {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
                {searchParams.q    && <input type="hidden" name="q"    value={searchParams.q}    />}
                <input
                  name="city"
                  type="text"
                  defaultValue={searchParams.city ?? ''}
                  placeholder="Search city…"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-[#f0f2f5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                />
                <button type="submit" aria-label="Search city" className="shrink-0 rounded-lg bg-[#1877F2] px-3 py-2 text-white">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                </button>
              </form>
              {/* Price range */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Price range</p>
                {priceRangeSection}
              </div>
              {/* Proximity */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Proximity</p>
                {proximitySection}
              </div>
              {/* Campaign dates */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Campaign dates</p>
                {campaignDatesSection}
              </div>
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
                  : 'Try adjusting your filters.'}
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
      <div className={`flex-1 bg-white ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        <SpaceMapWrapper
          markers={filteredMarkers}
          hoveredId={hoveredId}
          onMarkerHover={handleMarkerHover}
          userLocation={userLocation}
          radiusMiles={radiusMiles}
          searchCity={searchParams.city}
        />
      </div>

    </div>
  )
}
