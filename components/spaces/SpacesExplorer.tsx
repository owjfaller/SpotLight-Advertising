'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import SpaceCard from '@/components/spaces/SpaceCard'
import SpaceMapWrapper from '@/components/spaces/SpaceMapWrapper'
import { AdSpace, AdSpaceMapMarker } from '@/lib/types/database.types'
import { haversineDistance } from '@/lib/utils/haversine'

const SPACE_TYPES   = ['Billboard', 'Vehicle', 'Indoor', 'Outdoor', 'Digital', 'Event']
const PRICE_MAX     = 5000
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

const sectionLabel = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#9a8c7a',
  marginBottom: '0.5rem',
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

  // ── Shared input style ─────────────────────────────────────────────────────
  const sidebarInputStyle = {
    background: '#f7f3ed',
    border: '1px solid #e5ddd0',
    color: '#1a1208',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    padding: '0.5rem 0.75rem',
    width: '100%',
    outline: 'none',
  }

  // ── Reusable sidebar sections ──────────────────────────────────────────────

  const priceRangeSection = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '0.75rem', color: '#9a8c7a' }}>Min</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b07d10' }}>
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
        className="w-full accent-[#e8a838]"
      />
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '0.75rem', color: '#9a8c7a' }}>Max</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b07d10' }}>
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
        className="w-full accent-[#e8a838]"
      />
      <div className="flex justify-between" style={{ fontSize: '0.75rem', color: '#9a8c7a' }}>
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
        className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-50"
        style={{ border: '1px solid #e5ddd0', color: '#6b5e4e', background: 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(232,168,56,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden style={{ color: '#b07d10' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {geoLoading ? 'Locating…' : userLocation ? 'Update location' : 'Near me'}
      </button>

      {geoError && <p style={{ fontSize: '0.75rem', color: '#c0392b' }}>{geoError}</p>}

      {userLocation && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.75rem', color: '#9a8c7a' }}>Radius</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b07d10' }}>{radiusMiles} mi</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-full accent-[#e8a838]"
          />
          <div className="flex justify-between" style={{ fontSize: '0.75rem', color: '#9a8c7a' }}>
            <span>1 mi</span>
            <span>100 mi</span>
          </div>
          <button
            onClick={clearLocation}
            style={{ fontSize: '0.75rem', color: '#9a8c7a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#b07d10')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9a8c7a')}
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
        <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.7rem', color: '#9a8c7a' }}>Start date</label>
        <input
          type="date"
          value={startDate}
          min={today}
          onChange={(e) => {
            setStartDate(e.target.value)
            if (endDate && e.target.value > endDate) setEndDate('')
          }}
          style={sidebarInputStyle}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.7rem', color: '#9a8c7a' }}>End date</label>
        <input
          type="date"
          value={endDate}
          min={startDate || today}
          onChange={(e) => setEndDate(e.target.value)}
          style={sidebarInputStyle}
        />
      </div>
      {startDate && endDate && (
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b07d10' }}>
          {startDate} → {endDate}
        </p>
      )}
      {(startDate || endDate) && (
        <button
          onClick={() => { setStartDate(''); setEndDate('') }}
          style={{ fontSize: '0.75rem', color: '#9a8c7a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#b07d10')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9a8c7a')}
        >
          Clear dates
        </button>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-[calc(100vh-56px)] overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col overflow-hidden"
        style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}
      >
        <div className="flex-none px-5 py-2.5" style={{ background: '#e8a838', borderBottom: '1px solid #d4922a' }}>
          <h1
            className="font-display"
            style={{ fontSize: '1.35rem', color: '#0d1117', letterSpacing: '-0.01em' }}
          >
            Marketplace
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* City search */}
          <div>
            <p style={sectionLabel}>City</p>
            <form method="GET" action="/spaces" className="flex gap-1.5">
              {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
              {searchParams.q    && <input type="hidden" name="q"    value={searchParams.q}    />}
              <input
                name="city"
                type="text"
                defaultValue={searchParams.city ?? ''}
                placeholder="e.g. Chicago"
                style={{ ...sidebarInputStyle, flex: 1, minWidth: 0 }}
              />
              <button
                type="submit"
                aria-label="Search city"
                className="shrink-0 rounded-lg px-3 py-2 transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)', color: '#0d1117' }}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Space type */}
          <div>
            <p style={sectionLabel}>Space type</p>
            <div className="flex flex-col gap-0.5">
              <a
                href={allTypesUrl}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: !searchParams.type ? '#e8a838' : 'transparent',
                  color: !searchParams.type ? '#0d1117' : '#6b5e4e',
                }}
              >
                All types
              </a>
              {SPACE_TYPES.map((t) => (
                <a
                  key={t}
                  href={buildUrl({ city: searchParams.city, q: searchParams.q, type: t })}
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    background: searchParams.type === t ? '#e8a838' : 'transparent',
                    color: searchParams.type === t ? '#0d1117' : '#6b5e4e',
                  }}
                >
                  {t}
                </a>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <p style={sectionLabel}>Price range</p>
            {priceRangeSection}
          </div>

          {/* Proximity */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <p style={sectionLabel}>Proximity</p>
            {proximitySection}
          </div>

          {/* Campaign dates */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <p style={sectionLabel}>Campaign dates</p>
            {campaignDatesSection}
          </div>

        </nav>
      </aside>

      {/* ── Card list column ── */}
      <div
        className={`flex flex-col overflow-hidden w-full md:w-[28rem] md:shrink-0 ${
          mobileView === 'map' ? 'hidden md:flex' : 'flex'
        }`}
        style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}
      >
        {/* Header bar */}
        <div
          className="flex-none px-4 py-3"
          style={{ borderBottom: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '0.8125rem', color: '#9a8c7a' }}>
              <span style={{ fontWeight: 600, color: '#1a1208' }}>{filteredSpaces.length}</span>{' '}
              {filteredSpaces.length === 1 ? 'listing' : 'listings'}
              {searchParams.type ? ` · ${searchParams.type}` : ''}
              {searchParams.city ? ` in ${searchParams.city}` : ''}
            </p>

            {/* Mobile controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setShowMobileFilters((v) => !v)}
                className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: showMobileFilters || userLocation || minPriceDollars > 0 || maxPriceDollars < PRICE_MAX
                    ? '#e8a838' : '#e5ddd0',
                  color: showMobileFilters || userLocation || minPriceDollars > 0 || maxPriceDollars < PRICE_MAX
                    ? '#b07d10' : '#6b5e4e',
                  background: 'transparent',
                }}
              >
                Filters
              </button>
              <div
                className="flex overflow-hidden rounded-lg border"
                style={{ borderColor: '#e5ddd0' }}
              >
                <button
                  onClick={() => setMobileView('list')}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: mobileView === 'list' ? '#e8a838' : 'transparent',
                    color: mobileView === 'list' ? '#0d1117' : '#6b5e4e',
                  }}
                >
                  List
                </button>
                <button
                  onClick={() => setMobileView('map')}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: mobileView === 'map' ? '#e8a838' : 'transparent',
                    color: mobileView === 'map' ? '#0d1117' : '#6b5e4e',
                  }}
                >
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filters (collapsible) */}
          {showMobileFilters && (
            <div
              className="mt-3 space-y-4 pt-3 md:hidden"
              style={{ borderTop: '1px solid #e5e7eb' }}
            >
              {/* City */}
              <form method="GET" action="/spaces" className="flex gap-1.5">
                {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
                {searchParams.q    && <input type="hidden" name="q"    value={searchParams.q}    />}
                <input
                  name="city"
                  type="text"
                  defaultValue={searchParams.city ?? ''}
                  placeholder="Search city…"
                  style={{ ...sidebarInputStyle, flex: 1, minWidth: 0 }}
                />
                <button
                  type="submit"
                  aria-label="Search city"
                  className="shrink-0 rounded-lg px-3 py-2 transition-opacity hover:opacity-80"
                  style={{ background: '#e8a838', color: '#0d1117' }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                </button>
              </form>
              <div>
                <p style={sectionLabel}>Price range</p>
                {priceRangeSection}
              </div>
              <div>
                <p style={sectionLabel}>Proximity</p>
                {proximitySection}
              </div>
              <div>
                <p style={sectionLabel}>Campaign dates</p>
                {campaignDatesSection}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable card grid */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: '#faf7f2' }}>
          {filteredSpaces.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1208' }}>No listings found</p>
              <p className="mt-1" style={{ fontSize: '0.875rem', color: '#9a8c7a' }}>
                {userLocation
                  ? 'Try increasing the radius or clearing the location filter.'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredSpaces.map((space) => (
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
              ))}
            </div>
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
