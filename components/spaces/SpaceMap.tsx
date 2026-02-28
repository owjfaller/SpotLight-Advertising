'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import Link from 'next/link'
import L from 'leaflet'
import { AdSpaceMapMarker } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/formatters'

function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

function createMarkerIcon(isHovered: boolean): L.DivIcon {
  const size   = isHovered ? 24 : 16
  const bg     = isHovered ? '#1d4ed8' : '#3b82f6'
  const border = isHovered ? '3px solid #1e3a8a' : '2px solid #fff'
  const shadow = isHovered ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.3)'
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};box-shadow:${shadow};transition:all 0.15s ease;"></div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Controls map movement: flies to user location, fits marker bounds, or
// geocodes the searched city when it has no matching listings.
function MapController({
  userLocation,
  markers,
  searchCity,
}: {
  userLocation: [number, number] | null
  markers: AdSpaceMapMarker[]
  searchCity?: string
}) {
  const mapRef           = useRef<ReturnType<typeof useMap> | null>(null)
  mapRef.current         = useMap()
  const prevUserLocation = useRef<[number, number] | null>(null)
  const isFirstRender    = useRef(true)
  const prevMarkerKey    = useRef('')
  const prevSearchCity   = useRef<string | undefined>(undefined)

  // ── Fly to user location when it changes ──────────────────────────────────
  useEffect(() => {
    if (!userLocation) return
    if (
      prevUserLocation.current !== null &&
      prevUserLocation.current[0] === userLocation[0] &&
      prevUserLocation.current[1] === userLocation[1]
    ) return
    prevUserLocation.current = userLocation
    mapRef.current!.flyTo(userLocation, 12, { animate: true, duration: 1.2 })
  }, [userLocation])

  // ── Fly to marker bounds or geocode city when filter changes ──────────────
  useEffect(() => {
    const m = mapRef.current!

    if (isFirstRender.current) {
      isFirstRender.current  = false
      prevMarkerKey.current  = markers.map((mk) => mk.id).sort().join(',')
      prevSearchCity.current = searchCity
      return
    }

    if (userLocation) return // proximity filter takes priority

    const markerKey      = markers.map((mk) => mk.id).sort().join(',')
    const markersChanged = markerKey !== prevMarkerKey.current
    const cityChanged    = searchCity !== prevSearchCity.current

    if (!markersChanged && !cityChanged) return
    prevMarkerKey.current  = markerKey
    prevSearchCity.current = searchCity

    if (markers.length > 0) {
      // Fit all matching markers in view
      if (markers.length === 1) {
        m.flyTo([markers[0].lat, markers[0].lng], 12, { animate: true, duration: 1.2 })
      } else {
        const bounds = L.latLngBounds(
          markers.map((mk) => [mk.lat, mk.lng] as [number, number]),
        )
        m.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true, duration: 1.2 })
      }
    } else if (searchCity && cityChanged) {
      // No matching listings — geocode the city name and still fly there
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchCity)}&format=json&limit=1`,
      )
        .then((r) => r.json())
        .then((results: Array<{ lat: string; lon: string }>) => {
          if (results[0]) {
            m.flyTo(
              [parseFloat(results[0].lat), parseFloat(results[0].lon)],
              12,
              { animate: true, duration: 1.2 },
            )
          }
        })
        .catch(() => {}) // fail silently
    }
  }, [userLocation, markers, searchCity])

  return null
}

interface SpaceMapProps {
  markers: AdSpaceMapMarker[]
  hoveredId: string | null
  onMarkerHover: (id: string | null) => void
  userLocation: [number, number] | null
  radiusMiles: number
  searchCity?: string
}

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]
const DEFAULT_ZOOM = 4

export default function SpaceMap({
  markers,
  hoveredId,
  onMarkerHover,
  userLocation,
  radiusMiles,
  searchCity,
}: SpaceMapProps) {
  useEffect(() => { fixLeafletIcons() }, [])

  const center: [number, number] =
    userLocation ??
    (markers.length > 0 ? [markers[0].lat, markers[0].lng] : DEFAULT_CENTER)
  const zoom = markers.length > 0 ? (markers.length === 1 ? 12 : 5) : DEFAULT_ZOOM

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={100}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        userLocation={userLocation}
        markers={markers}
        searchCity={searchCity}
      />

      {userLocation && (
        <Circle
          center={userLocation}
          radius={radiusMiles * 1609.34}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08 }}
        />
      )}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={createMarkerIcon(hoveredId === marker.id)}
          eventHandlers={{
            mouseover: () => onMarkerHover(marker.id),
            mouseout:  () => onMarkerHover(null),
          }}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-gray-900">{marker.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {marker.space_type} · {marker.city}
              </p>
              <p className="mt-1 font-bold text-indigo-600">
                {formatPrice(marker.price_cents)}/mo
              </p>
              <Link
                href={`/spaces/${marker.id}`}
                className="mt-2 block rounded bg-indigo-600 px-3 py-1 text-center text-xs font-medium text-white hover:bg-indigo-700"
              >
                View listing
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
