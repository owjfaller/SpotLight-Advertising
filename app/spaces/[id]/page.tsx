'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/services/api'
import { AdSpace } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/formatters'
import ContactBlock from '@/components/spaces/ContactBlock'
import InterestedButton from '@/components/spaces/InterestedButton'
import ReviewsSection from '@/components/spaces/ReviewsSection'

interface SpaceDetailPageProps {
  params: { id: string }
}

const typeColors: Record<string, string> = {
  Billboard: 'bg-blue-100',
  Vehicle:   'bg-amber-100',
  Indoor:    'bg-green-100',
  Outdoor:   'bg-sky-100',
  Digital:   'bg-purple-100',
  Event:     'bg-pink-100',
}

export default function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const [space, setSpace] = useState<AdSpace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpace() {
      try {
        const data = await api.getListingById(params.id)
        setSpace(data)
      } catch (error) {
        console.error('Failed to fetch space:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSpace()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!space) notFound()

  // Fallback for missing extras
  const extras = {
    duration_min:          'Contact for details',
    availability:          'Contact owner',
    owner_name:            'Space Owner',
    owner_since:           '2024',
    owner_response_rate:   'N/A',
    owner_listings:        1,
  }

  const imageUrl = space.image_url || `https://picsum.photos/seed/spotlight-${space.id}/1200/600`
  const color    = typeColors[space.space_type] ?? 'bg-gray-100'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f0f2f5]">

      {/* ── Hero image ── */}
      <div className={`relative h-56 w-full overflow-hidden md:h-80 ${color}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={space.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white">
          {space.space_type}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-4 py-5">
        <Link
          href="/spaces"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#1877F2] hover:underline"
        >
          ← Back to listings
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* ── Left column ── */}
          <div className="flex-1 space-y-4">

            {/* Title + price */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">{space.title}</h1>
              <p className="mt-2 text-3xl font-bold text-[#1877F2]">
                {formatPrice(space.price_cents)}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
            </div>

            {/* Location */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Location
              </h2>
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#1877F2]"
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  {space.address && <p className="font-medium text-gray-900">{space.address}</p>}
                  <p className="text-sm text-gray-500">{space.city}</p>
                </div>
              </div>
            </div>

            {/* About */}
            {space.description && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  About this space
                </h2>
                <p className="text-sm leading-relaxed text-gray-700">{space.description}</p>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewsSection spaceId={space.id} />

            {/* Listing details */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Listing details
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-400">Space type</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{space.space_type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">City</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{space.city}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Min. duration</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{extras.duration_min}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Availability</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{extras.availability}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Monthly price</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">
                    {formatPrice(space.price_cents)}/mo
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Status</dt>
                  <dd className="mt-0.5">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ── Right column (sticky) ── */}
          <div className="space-y-4 lg:w-80 lg:shrink-0">

            {/* Price + campaign dates + CTA */}
            <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(space.price_cents)}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </div>
              <InterestedButton spaceId={space.id} />
              <ContactBlock
                listingTitle={space.title}
                ownerName={extras.owner_name}
              />
              <Link
                href="/spaces"
                className="block w-full rounded-lg border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back to listings
              </Link>
            </div>

            {/* Owner card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Listed by
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-[#1877F2]">
                  {extras.owner_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{extras.owner_name}</p>
                  <p className="text-xs text-gray-400">Member since {extras.owner_since}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400">Response rate</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{extras.owner_response_rate}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400">Listings</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{extras.owner_listings}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
