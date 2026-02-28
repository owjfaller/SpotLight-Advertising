'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import NavbarActions from './NavbarActions'

export default function NavbarShell({ user }: { user: User | null }) {
  const pathname = usePathname()
  const isLight = pathname.startsWith('/spaces') || pathname.startsWith('/dashboard')
  const isBlack = false

  return (
    <nav
      className="sticky top-0 z-50 h-14 border-b"
      style={{
        background: isBlack ? '#000' : isLight ? '#fff' : 'rgba(13,17,23,0.92)',
        backdropFilter: isLight ? 'none' : 'blur(12px)',
        borderColor: isBlack ? '#222' : isLight ? '#e5ddd0' : 'var(--border)',
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display shrink-0 flex items-center gap-2 text-3xl tracking-tight"
          style={{ color: 'var(--accent)', marginRight: '16px' }}
        >
          {/* Mini spotlight icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            {/* Lamp head */}
            <rect x="8" y="3" width="8" height="3.5" rx="1.2" fill="currentColor" opacity="0.9"/>
            {/* Beam */}
            <path d="M9 6.5L3 20h18L15 6.5z" fill="currentColor" opacity="0.25"/>
            {/* Inner bright core */}
            <path d="M10.5 6.5L6.5 17h11l-4-10.5z" fill="currentColor" opacity="0.45"/>
            {/* Lens highlight */}
            <ellipse cx="12" cy="6.8" rx="3.2" ry="1.1" fill="currentColor" opacity="1"/>
          </svg>
          SpotLight
        </Link>

        {/* Search bar */}
        <form action="/spaces" method="GET" className="flex flex-1 max-w-sm">
          <div
            className="flex w-full items-center rounded-full px-4 py-1.5 border"
            style={{
              background: isLight ? '#f7f3ed' : 'var(--surface)',
              borderColor: isLight ? '#e5ddd0' : 'var(--border)',
            }}
          >
            <svg
              className="mr-2 h-3.5 w-3.5 shrink-0"
              style={{ color: isLight ? '#9a8c7a' : 'var(--text-muted)' }}
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
              style={{ color: isLight ? '#1a1208' : 'var(--text)' } as React.CSSProperties}
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/spaces"
            className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-black/5"
            style={{ color: isLight ? '#6b5e4e' : 'var(--text-muted)' }}
          >
            Browse
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-black/5"
              style={{ color: isLight ? '#6b5e4e' : 'var(--text-muted)' }}
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
