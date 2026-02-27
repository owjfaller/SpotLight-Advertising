import Link from 'next/link'
import { AdSpace } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/formatters'

interface SpaceCardProps {
  space: AdSpace
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link
      href={`/spaces/${space.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-gray-900 line-clamp-1">{space.title}</h2>
        <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {space.space_type}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{space.city}</p>
      {space.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{space.description}</p>
      )}
      <p className="mt-3 text-base font-bold text-indigo-600">
        {formatPrice(space.price_cents)}<span className="text-sm font-normal text-gray-500">/mo</span>
      </p>
    </Link>
  )
}
