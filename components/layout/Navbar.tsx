import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavbarActions from './NavbarActions'

export default async function Navbar() {
  let user = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase not configured yet
  }

  return (
    <nav
      className="sticky top-0 z-50 h-14 border-b"
      style={{
        background: 'rgba(13,17,23,0.92)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display shrink-0 text-xl tracking-tight"
          style={{ color: 'var(--accent)' }}
        >
          SpotLight
        </Link>

        {/* Search bar */}
        <form action="/spaces" method="GET" className="flex flex-1 max-w-sm">
          <div
            className="flex w-full items-center rounded-full px-4 py-1.5 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <svg
              className="mr-2 h-3.5 w-3.5 shrink-0"
              style={{ color: 'var(--text-muted)' }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              name="q"
              type="search"
              placeholder="Search spaces…"
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--text)', '--tw-placeholder-opacity': '1' } as React.CSSProperties}
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/spaces"
            className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            Browse
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="ml-auto shrink-0">
          <NavbarActions user={user} />
        </div>
      </div>
    </nav>
  )
}
