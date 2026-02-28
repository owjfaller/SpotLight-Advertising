import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavbarActions from './NavbarActions'

export default async function Navbar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 h-14 border-b border-gray-300 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-xl font-bold text-[#1877F2]">
          SpotLight
        </Link>

        {/* Search bar */}
        <form action="/spaces" method="GET" className="flex flex-1 max-w-sm">
          <div className="flex w-full items-center rounded-full bg-[#f0f2f5] px-4 py-1.5">
            <svg
              className="mr-2 h-4 w-4 shrink-0 text-gray-500"
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
              placeholder="Search SpotLight"
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/spaces"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Browse
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
