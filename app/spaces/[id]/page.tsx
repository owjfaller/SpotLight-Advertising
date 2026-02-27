import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSpaceById } from '@/lib/queries/spaces'
import { formatPrice } from '@/lib/utils/formatters'

interface SpaceDetailPageProps {
  params: { id: string }
}

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const space = await getSpaceById(params.id)

  if (!space) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/spaces"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        ← Back to listings
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{space.title}</h1>
          <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            {space.space_type}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500">{space.city}</p>

        <p className="mt-4 text-3xl font-bold text-indigo-600">
          {formatPrice(space.price_cents)}
          <span className="text-base font-normal text-gray-500">/mo</span>
        </p>

        {space.description && (
          <p className="mt-4 text-gray-700 leading-relaxed">{space.description}</p>
        )}

        <button
          className="mt-8 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          type="button"
        >
          Send Inquiry
        </button>
      </div>
    </div>
  )
}
