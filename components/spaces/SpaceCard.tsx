import Link from 'next/link'
import { AdSpace } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/formatters'

interface SpaceCardProps {
  space: AdSpace
}

// Deterministic placeholder color per space type
const typeColors: Record<string, string> = {
  Billboard: 'bg-blue-100',
  Vehicle: 'bg-amber-100',
  Indoor: 'bg-green-100',
  Outdoor: 'bg-sky-100',
  Digital: 'bg-purple-100',
  Event: 'bg-pink-100',
}

const typeEmojis: Record<string, string> = {
  Billboard: '🪧',
  Vehicle: '🚚',
  Indoor: '🏢',
  Outdoor: '🌳',
  Digital: '📺',
  Event: '🎪',
}

export default function SpaceCard({ space }: SpaceCardProps) {
  const color = typeColors[space.space_type] ?? 'bg-gray-100'
  const emoji = typeEmojis[space.space_type] ?? '📍'

  return (
    <Link href={`/spaces/${space.id}`} className="group block">
      {/* Square image area */}
      <div
        className={`relative aspect-square w-full rounded-lg ${color} flex items-center justify-center overflow-hidden`}
      >
        <span className="text-5xl">{emoji}</span>
        {/* Type badge */}
        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          {space.space_type}
        </span>
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
