'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdSpace } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/formatters'

interface SpaceCardProps {
  space: AdSpace
  isHighlighted?: boolean
  isFavorited?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onToggleFavorite?: (e: React.MouseEvent) => void
}

const typeColors: Record<string, string> = {
  Billboard: '#1c1208',
  Vehicle:   '#1a1005',
  Indoor:    '#0e1408',
  Outdoor:   '#091610',
  Digital:   '#14101e',
  Event:     '#1e0e0a',
}



export default function SpaceCard({
  space,
  isHighlighted,
  isFavorited,
  onMouseEnter,
  onMouseLeave,
  onToggleFavorite,
}: SpaceCardProps) {
  const color = typeColors[space.space_type] ?? '#1a2130'
  const uploadedUrl = (space as AdSpace & { image_url?: string }).image_url ?? null
  const seed = encodeURIComponent(space.title ?? space.id)
  const picsumUrl = `https://picsum.photos/seed/${seed}/400/300`

  // src cycles: uploadedUrl → picsumUrl → null (solid colour fallback)
  const [src, setSrc] = useState<string | null>(uploadedUrl ?? picsumUrl)
  const showImage = src !== null

  return (
    <Link
      href={`/spaces/${space.id}`}
      className="group block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image */}
      <div
        className="relative aspect-[4/3] w-full rounded-xl overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-lg"
        style={{
          background: color,
          boxShadow: isHighlighted ? `0 0 0 2px var(--accent)` : undefined,
        }}
      >
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={space.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => {
              // If uploaded image failed, try picsum; if picsum failed, show solid colour
              if (src === uploadedUrl) setSrc(picsumUrl)
              else setSrc(null)
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Price overlay bottom-left */}
        <div className="absolute bottom-2.5 left-2.5">
          <span
            className="rounded-md px-2 py-1 text-xs font-bold backdrop-blur-sm"
            style={{ background: 'rgba(13,17,23,0.75)', color: 'var(--accent)' }}
          >
            {formatPrice(space.price_cents)}/mo
          </span>
        </div>

        {/* Type badge bottom-right */}
        <span
          className="absolute bottom-2.5 right-2.5 rounded-md px-2 py-0.5 text-xs font-medium backdrop-blur-sm"
          style={{ background: 'rgba(13,17,23,0.6)', color: 'rgba(255,255,255,0.85)' }}
        >
          {space.space_type}
        </span>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavorite?.(e)
          }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-2 top-2 rounded-full p-1.5 transition-colors hover:bg-white/20"
          style={{ background: 'rgba(13,17,23,0.5)' }}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill={isFavorited ? '#e8a838' : 'none'}
            stroke={isFavorited ? '#e8a838' : 'rgba(255,255,255,0.7)'}
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p
          className="text-sm font-medium line-clamp-1 transition-colors group-hover:opacity-80"
          style={{ color: '#1a1a1a' }}
        >
          {space.title}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{space.city}</p>
      </div>
    </Link>
  )
}
