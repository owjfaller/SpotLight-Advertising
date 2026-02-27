'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

interface SpaceMapProps {
  markers: AdSpaceMapMarker[]
}

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795] // continental US center
const DEFAULT_ZOOM = 4

export default function SpaceMap({ markers }: SpaceMapProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const center: [number, number] =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : DEFAULT_CENTER
  const zoom = markers.length > 0 ? 10 : DEFAULT_ZOOM

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-gray-900">{marker.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{marker.space_type} · {marker.city}</p>
              <p className="mt-1 font-bold text-indigo-600">{formatPrice(marker.price_cents)}/mo</p>
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
