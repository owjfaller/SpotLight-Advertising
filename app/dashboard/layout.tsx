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
    <div className="flex min-h-[calc(100vh-56px)]" style={{ background: '#fff' }}>
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 md:block" style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}>
        <nav className="flex flex-col gap-0.5 p-3 pt-4">
          {navItems.map(({ href, label, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-gray-100"
              style={{ color: '#374151' }}
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t pt-2" style={{ borderColor: '#e5e7eb' }}>
            <Link
              href="/spaces/new"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:opacity-90"
              style={{ background: '#e8a838', color: '#0d1117' }}
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
