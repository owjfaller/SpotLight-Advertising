import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { href: '/dashboard', label: 'Overview', emoji: '🏠' },
  { href: '/dashboard/listings', label: 'Your listings', emoji: '📋' },
  { href: '/dashboard/inquiries', label: 'Inquiries', emoji: '💬' },
  { href: '/dashboard/profile', label: 'Profile', emoji: '👤' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login')

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-[#f0f2f5]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 bg-white border-r border-gray-200 md:block">
        <div className="p-4 border-b border-gray-200">
          <p className="font-bold text-gray-900">Selling</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {navItems.map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#f0f2f5]"
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t border-gray-200 pt-2">
            <Link
              href="/spaces/new"
              className="flex items-center gap-3 rounded-lg bg-[#1877F2] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5] transition"
            >
              <span>+</span>
              New listing
            </Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-5">{children}</main>
    </div>
  )
}
