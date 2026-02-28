import Link from 'next/link'

const categories = [
  { emoji: '🪧', label: 'Billboards',      type: 'Billboard' },
  { emoji: '🚚', label: 'Vehicle wraps',   type: 'Vehicle'   },
  { emoji: '🏢', label: 'Indoor spaces',   type: 'Indoor'    },
  { emoji: '🌳', label: 'Outdoor',         type: 'Outdoor'   },
  { emoji: '📺', label: 'Digital screens', type: 'Digital'   },
  { emoji: '🎪', label: 'Event signage',   type: 'Event'     },
  { emoji: '🏪', label: 'Storefronts',     type: 'Indoor'    },
  { emoji: '📦', label: 'Packaging',       type: 'Other'     },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>

        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay — keeps text readable over video */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 1,
            background: 'linear-gradient(to bottom, rgba(13,17,23,0.72) 0%, rgba(13,17,23,0.55) 50%, rgba(13,17,23,0.92) 100%)',
          }}
        />

        {/* Amber glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ zIndex: 1, width: 600, height: 300, marginTop: -100, background: 'var(--accent)' }}
        />

        <div className="relative mx-auto w-full max-w-3xl" style={{ zIndex: 2 }}>
          <span
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-widest"
            style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: 'rgba(232,168,56,0.08)' }}
          >
            ✦ The unconventional ad marketplace
          </span>

          <h1 className="font-display mt-4 text-balance text-5xl leading-[1.1] md:text-7xl" style={{ color: 'var(--text)' }}>
            Advertising spaces<br />
            <span style={{ color: 'var(--accent)' }}>you won&apos;t find</span><br />
            anywhere else.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-muted)' }}>
            From vehicle wraps to warehouse walls — discover unique surfaces that
            cut through the noise and reach your audience where they least expect it.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/spaces"
              className="rounded-lg px-8 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--accent)', color: '#0d1117' }}
            >
              Browse spaces
            </Link>
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/signup"
                className="rounded-lg border px-8 py-3.5 text-sm font-semibold transition hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                List your space
              </Link>
              <Link
                href="/spaces/new"
                className="text-xs transition hover:underline"
                style={{ color: 'var(--text-faint)' }}
              >
                Continue without logging in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
            3,000+ spaces · 50+ cities · Free to list
          </p>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--text)' }}>
              Browse by category
            </h2>
            <Link href="/spaces" className="text-sm transition hover:opacity-80" style={{ color: 'var(--accent)' }}>
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {categories.map(({ emoji, label, type }) => (
              <Link
                key={label}
                href={`/spaces?type=${type}`}
                className="group flex flex-col items-center gap-2.5 rounded-xl border p-4 transition hover:border-amber-500/40 hover:bg-white/5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <span className="text-3xl transition-transform group-hover:scale-110">{emoji}</span>
                <span className="text-center text-xs font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="px-4 py-16" id="how-it-works">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display mb-12 text-center text-2xl md:text-3xl" style={{ color: 'var(--text)' }}>
            How SpotLight works
          </h2>

          <div className="grid gap-px md:grid-cols-3" style={{ background: 'var(--border)' }}>
            {[
              {
                num: '01',
                title: 'Owners list their space',
                body: 'Describe your surface, set your price, add photos. Live in minutes.',
              },
              {
                num: '02',
                title: 'Advertisers browse',
                body: 'Filter by location, type, and budget. See everything on an interactive map.',
              },
              {
                num: '03',
                title: 'Connect and close',
                body: 'Message directly on-platform and finalize your campaign.',
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="p-8" style={{ background: 'var(--surface)' }}>
                <p className="font-display mb-4 text-4xl" style={{ color: 'var(--accent)' }}>{num}</p>
                <p className="mb-2 font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Split CTA ────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl grid gap-4 md:grid-cols-2">
          <div
            className="rounded-2xl p-8 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="font-display text-2xl" style={{ color: 'var(--text)' }}>Have a space to monetize?</p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              List it free and start earning from your idle surfaces. No fees until you close.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/signup"
                className="inline-block rounded-lg px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]"
                style={{ background: 'var(--accent)', color: '#0d1117' }}
              >
                List a space
              </Link>
              <Link
                href="/spaces/new"
                className="text-xs transition hover:underline"
                style={{ color: 'var(--text-faint)' }}
              >
                Continue without logging in
              </Link>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="font-display text-2xl" style={{ color: 'var(--text)' }}>Looking to advertise?</p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Browse hundreds of unique spaces that reach your audience in unexpected places.
            </p>
            <Link
              href="/spaces"
              className="mt-6 inline-block rounded-lg border px-6 py-3 text-sm font-semibold transition hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Browse spaces
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
