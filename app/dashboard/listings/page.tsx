import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdSpace } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/formatters'

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Published' },
  draft:     { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Draft' },
  archived:  { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', label: 'Archived' },
}

export default async function ListingsPage() {
  let listings: AdSpace[] = []
  let fetchError = false

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('ad_spaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) listings = data as AdSpace[]
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
          <h1 className="text-xl font-semibold" style={{ color: '#111827' }}>Your listings</h1>
          <p className="mt-0.5 text-sm" style={{ color: '#6b7280' }}>
            {listings.length === 0 ? 'No listings yet' : `${listings.length} listing${listings.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/spaces/new"
          className="rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ background: '#e8a838', color: '#0d1117' }}
        >
          + New listing
        </Link>
      </div>

      {fetchError && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#dc2626' }}>
          Could not load listings. Please try again.
        </div>
      )}

      {!fetchError && listings.length === 0 && (
        <div
          className="rounded-2xl border-2 border-dashed px-6 py-16 text-center"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'rgba(232,168,56,0.1)' }}
          >
            <svg className="h-5 w-5" fill="none" stroke="#e8a838" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="font-medium" style={{ color: '#111827' }}>No listings yet</p>
          <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Create your first ad space to start receiving inquiries.</p>
          <Link
            href="/spaces/new"
            className="mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: '#e8a838', color: '#0d1117' }}
          >
            Create a listing
          </Link>
        </div>
      )}

      {listings.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
          {listings.map((listing, i) => {
            const s = statusStyles[listing.status] ?? statusStyles.draft
            return (
              <div
                key={listing.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
                style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}
              >
                {/* Colour swatch */}
                <div
                  className="h-10 w-10 shrink-0 rounded-lg"
                  style={{ background: listing.image_url ? `url(${listing.image_url}) center/cover` : '#f3f4f6' }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium" style={{ color: '#111827' }}>{listing.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    {listing.space_type}{listing.city ? ` · ${listing.city}` : ''}
                  </p>
                </div>

                {/* Price */}
                <p className="shrink-0 text-sm font-medium" style={{ color: '#111827' }}>
                  {formatPrice(listing.price_cents)}<span className="font-normal" style={{ color: '#9ca3af' }}>/mo</span>
                </p>

                {/* Status badge */}
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>

                {/* View link */}
                <Link
                  href={`/spaces/${listing.id}`}
                  className="shrink-0 text-xs font-medium transition hover:opacity-70"
                  style={{ color: '#9ca3af' }}
                >
                  View →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
