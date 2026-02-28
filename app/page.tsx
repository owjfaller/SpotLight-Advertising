import Link from 'next/link'

const categories = [
  { emoji: '🪧', label: 'Billboards' },
  { emoji: '🚚', label: 'Vehicle wraps' },
  { emoji: '🏢', label: 'Indoor spaces' },
  { emoji: '🌳', label: 'Outdoor' },
  { emoji: '📺', label: 'Digital screens' },
  { emoji: '🎪', label: 'Event signage' },
  { emoji: '🏪', label: 'Storefronts' },
  { emoji: '📦', label: 'Packaging' },
]

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f0f2f5]">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Hero card */}
        <div className="mb-6 rounded-xl bg-[#1877F2] px-8 py-12 text-center text-white shadow-sm">
          <h1 className="mb-3 text-4xl font-bold leading-tight">
            Today&apos;s top ad spaces
          </h1>
          <p className="mb-6 text-blue-100 text-base">
            Discover unconventional advertising surfaces near you — from vehicle
            wraps to warehouse walls.
          </p>
          <Link
            href="/spaces"
            className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-bold text-[#1877F2] hover:bg-blue-50 transition"
          >
            Browse all listings
          </Link>
        </div>

        {/* Categories */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Browse by category</h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {categories.map(({ emoji, label }) => (
              <Link
                key={label}
                href={`/spaces?type=${label.split(' ')[0]}`}
                className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-[#f0f2f5] transition"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-center text-xs font-medium text-gray-700 leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">How SpotLight works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                emoji: '📋',
                title: 'Owners list their space',
                body: 'Describe your surface, set your price, add photos. Live in minutes.',
              },
              {
                emoji: '🔍',
                title: 'Advertisers browse',
                body: 'Filter by location, type, and budget. See everything on an interactive map.',
              },
              {
                emoji: '🤝',
                title: 'Connect and close',
                body: 'Message directly on-platform and finalize your deal.',
              },
            ].map(({ emoji, title, body }) => (
              <div key={title} className="flex gap-3">
                <span className="mt-0.5 text-2xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-sm text-gray-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sell CTA */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-lg font-bold text-gray-900">Have a space to monetize?</p>
            <p className="mt-1 text-sm text-gray-500">
              List it free and start earning from your idle surfaces.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-block rounded-lg bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5] transition"
            >
              List a space
            </Link>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-lg font-bold text-gray-900">Looking to advertise?</p>
            <p className="mt-1 text-sm text-gray-500">
              Browse hundreds of unique spaces that reach your audience.
            </p>
            <Link
              href="/spaces"
              className="mt-4 inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Browse spaces
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
