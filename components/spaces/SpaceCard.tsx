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
  Billboard: 'bg-blue-100',
  Vehicle:   'bg-amber-100',
  Indoor:    'bg-green-100',
  Outdoor:   'bg-sky-100',
  Digital:   'bg-purple-100',
  Event:     'bg-pink-100',
}

const typeEmojis: Record<string, string> = {
  Billboard: '🪧',
  Vehicle:   '🚚',
  Indoor:    '🏢',
  Outdoor:   '🌳',
  Digital:   '📺',
  Event:     '🎪',
}

export default function SpaceCard({
  space,
  isHighlighted,
  isFavorited,
  onMouseEnter,
  onMouseLeave,
  onToggleFavorite,
}: SpaceCardProps) {
  const [imgError, setImgError] = useState(false)

  const color   = typeColors[space.space_type] ?? 'bg-gray-100'
  const emoji   = typeEmojis[space.space_type] ?? '📍'
  // Deterministic unique image per listing — seed is stable per space ID
  const imageUrl = `https://picsum.photos/seed/spotlight-${space.id}/600/400`

  return (
    <Link
      href={`/spaces/${space.id}`}
      className="group block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Square image area */}
      <div
        className={`relative aspect-square w-full rounded-lg overflow-hidden flex items-center justify-center transition-shadow ${
          imgError ? color : ''
        } ${isHighlighted ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
      >
        {/* Photo background — eslint-disable-next-line @next/next/no-img-element */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {!imgError && (
          <img
            src={imageUrl}
            alt={space.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Fallback emoji */}
        {imgError && <span className="text-5xl">{emoji}</span>}

        {/* Gradient overlay so badges stay readable over photos */}
        {!imgError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        )}

        {/* Type badge */}
        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          {space.space_type}
        </span>

        {/* Favorite star */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavorite?.(e)
          }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1 shadow-sm transition-colors hover:bg-white"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={isFavorited ? '#f59e0b' : 'none'}
            stroke={isFavorited ? '#f59e0b' : '#6b7280'}
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

      {/* Info below image */}
      <div className="mt-1.5 px-0.5">
        <p className="text-base font-bold text-gray-900">
          {formatPrice(space.price_cents)}/mo
        </p>
        <p className="mt-0.5 text-sm font-medium text-gray-800 line-clamp-1 group-hover:underline">
          {space.title}
        </p>
        <p className="text-xs text-gray-500">{space.city}</p>
      </div>
    </Link>
  )
}
