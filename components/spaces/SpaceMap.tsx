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
  const shadow = isHovered
    ? '0 2px 8px rgba(0,0,0,0.4)'
    : '0 1px 3px rgba(0,0,0,0.3)'

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};box-shadow:${shadow};transition:all 0.15s ease;"></div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Handles programmatic map movement: flies to user location or fits marker bounds
// when the filtered marker set changes (e.g. after city/type filter navigation).
function MapController({
  userLocation,
  markers,
}: {
  userLocation: [number, number] | null
  markers: AdSpaceMapMarker[]
}) {
  const map               = useRef<ReturnType<typeof useMap> | null>(null)
  const mapInstance       = useMap()
  const prevUserLocation  = useRef<[number, number] | null>(null)
  const isFirstRender     = useRef(true)
  const prevMarkerKey     = useRef('')

  // keep ref current
  map.current = mapInstance

  useEffect(() => {
    const m = map.current!

    // ── Fly to user location when it's first set or updated ─────────────────
    if (
      userLocation &&
      (prevUserLocation.current === null ||
        prevUserLocation.current[0] !== userLocation[0] ||
        prevUserLocation.current[1] !== userLocation[1])
    ) {
      prevUserLocation.current = userLocation
      m.flyTo(userLocation, 12, { animate: true, duration: 1.2 })
      return
    }

    // ── On initial mount the MapContainer already used the correct center ────
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevMarkerKey.current = markers.map((mk) => mk.id).sort().join(',')
      return
    }

    // ── Fly to new markers when city/type filter changes (no proximity) ──────
    if (!userLocation) {
      const key = markers.map((mk) => mk.id).sort().join(',')
      if (key !== prevMarkerKey.current) {
        prevMarkerKey.current = key
        if (markers.length === 0) return
        if (markers.length === 1) {
          m.flyTo([markers[0].lat, markers[0].lng], 12, { animate: true, duration: 1.2 })
        } else {
          const bounds = L.latLngBounds(
            markers.map((mk) => [mk.lat, mk.lng] as [number, number]),
          )
          m.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true, duration: 1.2 })
        }
      }
    }
  }, [userLocation, markers])

  return null
}

interface SpaceMapProps {
  markers: AdSpaceMapMarker[]
  hoveredId: string | null
  onMarkerHover: (id: string | null) => void
  userLocation: [number, number] | null
  radiusMiles: number
}

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795]
const DEFAULT_ZOOM = 4

export default function SpaceMap({
  markers,
  hoveredId,
  onMarkerHover,
  userLocation,
  radiusMiles,
}: SpaceMapProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const center: [number, number] =
    userLocation ??
    (markers.length > 0 ? [markers[0].lat, markers[0].lng] : DEFAULT_CENTER)
  const zoom = markers.length > 0 ? (markers.length === 1 ? 12 : 5) : DEFAULT_ZOOM

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      // Smoother zoom: fractional snap + require more pixels per zoom step
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={100}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController userLocation={userLocation} markers={markers} />

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
                className="mt-2 block text-center rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
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
