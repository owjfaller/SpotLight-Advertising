import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSpaceById } from '@/lib/queries/spaces'
import { formatPrice } from '@/lib/utils/formatters'

interface SpaceDetailPageProps {
  params: { id: string }
}

const typeEmojis: Record<string, string> = {
  Billboard: '🪧',
  Vehicle: '🚚',
  Indoor: '🏢',
  Outdoor: '🌳',
  Digital: '📺',
  Event: '🎪',
}

const typeColors: Record<string, string> = {
  Billboard: 'bg-blue-100',
  Vehicle: 'bg-amber-100',
  Indoor: 'bg-green-100',
  Outdoor: 'bg-sky-100',
  Digital: 'bg-purple-100',
  Event: 'bg-pink-100',
}

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const space = await getSpaceById(params.id)
  if (!space) notFound()

  const emoji = typeEmojis[space.space_type] ?? '📍'
  const color = typeColors[space.space_type] ?? 'bg-gray-100'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f0f2f5]">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href="/spaces"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#1877F2] hover:underline"
        >
          ← Back to listings
        </Link>

        <div className="flex flex-col gap-4 md:flex-row">
          {/* Left — image */}
          <div className="md:w-[55%]">
            <div
              className={`flex aspect-square w-full items-center justify-center rounded-xl ${color}`}
            >
              <span className="text-8xl">{emoji}</span>
            </div>
          </div>

          {/* Right — details */}
          <div className="flex flex-col gap-4 md:w-[45%]">
            {/* Price card */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(space.price_cents)}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{space.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-[#e7f3ff] px-2.5 py-0.5 text-xs font-medium text-[#1877F2]">
                  {space.space_type}
                </span>
                <span className="text-sm text-gray-500">{space.city}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl bg-white p-5 shadow-sm flex flex-col gap-3">
              <button
                type="button"
                className="w-full rounded-lg bg-[#1877F2] py-3 text-sm font-semibold text-white hover:bg-[#166fe5] transition"
              >
                Send inquiry
              </button>
              <button
                type="button"
                className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Save listing
              </button>
            </div>

            {/* Description */}
            {space.description && (
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">About this space</h2>
                <p className="text-sm leading-relaxed text-gray-700">{space.description}</p>
              </div>
            )}

            {/* Details */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Listing details</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900">{space.space_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">City</dt>
                  <dd className="font-medium text-gray-900">{space.city}</dd>
                </div>
                {space.address && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900">{space.address}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(space.price_cents)}/mo
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
