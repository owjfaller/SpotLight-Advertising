'use client'

import dynamic from 'next/dynamic'
import { AdSpaceMapMarker } from '@/lib/types/database.types'

const SpaceMap = dynamic(() => import('./SpaceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gray-200 flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading map…</p>
    </div>
  ),
})

interface SpaceMapWrapperProps {
  markers: AdSpaceMapMarker[]
  hoveredId: string | null
  onMarkerHover: (id: string | null) => void
  userLocation: [number, number] | null
  radiusMiles: number
}

export default function SpaceMapWrapper({
  markers,
  hoveredId,
  onMarkerHover,
  userLocation,
  radiusMiles,
}: SpaceMapWrapperProps) {
  return (
    <SpaceMap
      markers={markers}
      hoveredId={hoveredId}
      onMarkerHover={onMarkerHover}
      userLocation={userLocation}
      radiusMiles={radiusMiles}
    />
  )
}
