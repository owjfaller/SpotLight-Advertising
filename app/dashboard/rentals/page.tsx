import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/formatters'

interface Rental {
  id: string
  status: string
  created_at: string
  ad_spaces: {
    id: string
    title: string
    space_type: string
    price_cents: number
    city: string | null
  } | null
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: 'rgba(234,179,8,0.1)',   color: '#a16207', label: 'Pending' },
  active:    { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', label: 'Active' },
  completed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Completed' },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', label: 'Cancelled' },
}

export default async function RentalsPage() {
  let rentals: Rental[] = []
  let fetchError = false

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          status,
          created_at,
          ad_spaces (
            id,
            title,
            space_type,
            price_cents,
            city
          )
        `)
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) rentals = data as Rental[]
      if (error) fetchError = true
    }
  } catch {
    fetchError = true
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#111827' }}>Your rentals</h1>
          <p className="mt-0.5 text-sm" style={{ color: '#6b7280' }}>
            {rentals.length === 0 ? 'No active rentals' : `${rentals.length} rental${rentals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/spaces"
          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          style={{ borderColor: '#e5e7eb', color: '#374151' }}
        >
          Browse spaces
        </Link>
      </div>

      {fetchError && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#dc2626' }}>
          Could not load rentals. Please try again.
        </div>
      )}

      {!fetchError && rentals.length === 0 && (
        <div
          className="rounded-2xl border-2 border-dashed px-6 py-16 text-center"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'rgba(232,168,56,0.1)' }}
          >
            <svg className="h-5 w-5" fill="none" stroke="#e8a838" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: '#111827' }}>No rentals yet</p>
          <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>
            Browse the marketplace and inquire on a space to get started.
          </p>
          <Link
            href="/spaces"
            className="mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: '#e8a838', color: '#0d1117' }}
          >
            Browse ad spaces
          </Link>
        </div>
      )}

      {rentals.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
          {rentals.map((rental, i) => {
            const space = rental.ad_spaces
            const s = statusStyles[rental.status] ?? statusStyles.pending
            const date = new Date(rental.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
            return (
              <div
                key={rental.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
                style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}
              >
                {/* Colour swatch */}
                <div
                  className="h-10 w-10 shrink-0 rounded-lg"
                  style={{ background: '#f3f4f6' }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium" style={{ color: '#111827' }}>
                    {space?.title ?? 'Unknown space'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    {space?.space_type}{space?.city ? ` · ${space.city}` : ''} · Inquired {date}
                  </p>
                </div>

                {/* Price */}
                {space && (
                  <p className="shrink-0 text-sm font-medium" style={{ color: '#111827' }}>
                    {formatPrice(space.price_cents)}<span className="font-normal" style={{ color: '#9ca3af' }}>/mo</span>
                  </p>
                )}

                {/* Status badge */}
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>

                {/* View link */}
                {space && (
                  <Link
                    href={`/spaces/${space.id}`}
                    className="shrink-0 text-xs font-medium transition hover:opacity-70"
                    style={{ color: '#9ca3af' }}
                  >
                    View →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
