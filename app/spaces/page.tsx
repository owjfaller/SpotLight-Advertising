'use client'

import { useEffect, useState } from 'react'
import { api, AdSpaceFilters } from '@/lib/services/api'
import { AdSpace, AdSpaceMapMarker, SpaceType } from '@/lib/types/database.types'
import SpacesExplorer from '@/components/spaces/SpacesExplorer'

interface SpacesPageProps {
  searchParams: {
    q?: string
    type?: string
    city?: string
  }
}

export default function SpacesPage({ searchParams }: SpacesPageProps) {
  const [spaces, setSpaces] = useState<AdSpace[]>([])
  const [mapMarkers, setMapMarkers] = useState<AdSpaceMapMarker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpaces() {
      try {
        setLoading(true)
        const filters: AdSpaceFilters = {
          type: searchParams.type as SpaceType | undefined,
          city: searchParams.city
        }
        const data = await api.getListings(filters)
        setSpaces(data)
        
        // Transform spaces to markers
        const markers: AdSpaceMapMarker[] = data
          .filter(s => s.lat != null && s.lng != null)
          .map(s => ({
            id: s.id,
            title: s.title,
            space_type: s.space_type,
            price_cents: s.price_cents,
            city: s.city,
            lat: s.lat!,
            lng: s.lng!
          }))
        setMapMarkers(markers)
      } catch (error) {
        console.error('Failed to fetch spaces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpaces()
  }, [searchParams])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <SpacesExplorer 
        spaces={spaces} 
        mapMarkers={mapMarkers} 
        searchParams={searchParams} 
      />
      {loading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </>
  )
}
