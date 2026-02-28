import Link from 'next/link'

const categories = [
  {
    label: 'Billboard',
    type: 'Billboard',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="6" y="8" width="28" height="17" rx="1.5" />
        <line x1="20" y1="25" x2="20" y2="34" />
        <line x1="14" y1="34" x2="26" y2="34" />
      </svg>
    ),
  },
  {
    label: 'Vehicle',
    type: 'Vehicle',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 26h32v-6l-4-8H8L4 20v6z" />
        <circle cx="11" cy="29" r="3" />
        <circle cx="29" cy="29" r="3" />
        <path d="M8 18h10v-4H11l-3 4z" />
        <line x1="18" y1="14" x2="18" y2="18" />
        <rect x="18" y="14" width="10" height="4" />
      </svg>
    ),
  },
  {
    label: 'Indoor',
    type: 'Indoor',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 34V16L20 6l14 10v18" />
        <rect x="15" y="23" width="10" height="11" />
        <line x1="6" y1="34" x2="34" y2="34" />
      </svg>
    ),
  },
  {
    label: 'Outdoor',
    type: 'Outdoor',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="20" cy="14" r="5" />
        <line x1="20" y1="6" x2="20" y2="4" />
        <line x1="20" y1="22" x2="20" y2="24" />
        <line x1="28" y1="14" x2="30" y2="14" />
        <line x1="10" y1="14" x2="12" y2="14" />
        <line x1="25.7" y1="8.3" x2="27.1" y2="6.9" />
        <line x1="12.9" y1="21.1" x2="14.3" y2="19.7" />
        <line x1="25.7" y1="19.7" x2="27.1" y2="21.1" />
        <line x1="12.9" y1="6.9" x2="14.3" y2="8.3" />
        <path d="M4 34c3-6 6-9 10-9s7 4 12 4 8-5 10-9" />
      </svg>
    ),
  },
  {
    label: 'Digital',
    type: 'Digital',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="5" y="8" width="30" height="20" rx="2" />
        <line x1="14" y1="34" x2="26" y2="34" />
        <line x1="20" y1="28" x2="20" y2="34" />
        <path d="M15 18l4 3 6-5" />
      </svg>
    ),
  },
  {
    label: 'Event',
    type: 'Event',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 34c4-12 8-18 16-18s12 6 16 18" />
        <path d="M10 34c2-8 5-12 10-12s8 4 10 12" />
        <line x1="20" y1="16" x2="20" y2="8" />
        <line x1="4" y1="34" x2="36" y2="34" />
        <circle cx="20" cy="7" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>

        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/spotlight-hero.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        />

        {/* Dark overlay */}
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
            <Link
              href="/login"
              className="rounded-lg border px-8 py-3.5 text-sm font-semibold transition hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              List your space
            </Link>
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

          <div className="grid grid-cols-3 gap-px md:grid-cols-6" style={{ background: 'var(--border)' }}>
            {categories.map(({ label, type, icon }) => (
              <Link
                key={label}
                href={`/spaces?type=${type}`}
                className="group relative flex flex-col items-center justify-center gap-4 px-4 py-8 transition-colors"
                style={{ background: 'var(--surface)' }}
              >
                {/* Amber fill on hover */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'rgba(232,168,56,0.05)' }}
                />

                {/* Icon */}
                <span
                  className="relative block h-10 w-10"
                  style={{ color: 'var(--accent)' }}
                >
                  {icon}
                </span>

                {/* Label */}
                <span
                  className="relative text-xs font-medium tracking-wide uppercase"
                  style={{ color: 'var(--accent)', letterSpacing: '0.08em' }}
                >
                  {label}
                </span>

                {/* Amber bottom bar */}
                <span
                  className="absolute bottom-0 left-1/2 h-px -translate-x-1/2 transition-all duration-300 group-hover:w-full"
                  style={{ background: 'var(--accent)', width: 0 }}
                />
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
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]"
              style={{ background: 'var(--accent)', color: '#0d1117' }}
            >
              List a space
            </Link>
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
