import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/queries/profiles'

export default async function DashboardPage() {
  let user = null
  let profile = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) profile = await getProfile(user.id)
  } catch {
    // Supabase not configured
  }
  const name = profile?.full_name ?? user?.email?.split('@')[0] ?? 'there'

  const stats = [
    { label: 'Active listings', value: '—', icon: '◈' },
    { label: 'Open inquiries', value: '—', icon: '◎' },
    { label: 'Unread messages', value: '—', icon: '◉' },
  ]

  const actions = [
    {
      href: '/spaces/new',
      label: 'Create a new listing',
      sub: 'Publish an ad space to the marketplace',
      show: profile?.can_be_owner ?? true,
    },
    {
      href: '/dashboard/listings',
      label: 'Manage your listings',
      sub: 'Edit, pause, or delete your spaces',
      show: profile?.can_be_owner ?? true,
    },
    {
      href: '/spaces',
      label: 'Browse ad spaces',
      sub: 'Find the right surface for your campaign',
      show: profile?.can_be_advertiser ?? true,
    },
    {
      href: '/dashboard/inquiries',
      label: 'View inquiries',
      sub: 'See all booking requests and messages',
      show: true,
    },
  ].filter((l) => l.show)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div
        className="mb-4 rounded-2xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
            style={{ background: 'rgba(232,168,56,0.15)', color: 'var(--accent)' }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>Hey, {name}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {profile && (
          <div className="mt-4 flex gap-2">
            {profile.can_be_owner && (
              <span
                className="rounded-full px-3 py-0.5 text-xs font-medium"
                style={{ background: 'rgba(232,168,56,0.12)', color: 'var(--accent)' }}
              >
                Space owner
              </span>
            )}
            {profile.can_be_advertiser && (
              <span
                className="rounded-full px-3 py-0.5 text-xs font-medium"
                style={{ background: 'rgba(100,200,120,0.12)', color: '#6dc87a' }}
              >
                Advertiser
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-2xl border p-5 text-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-xl" style={{ color: 'var(--text-faint)' }}>{icon}</p>
            <p className="font-display mt-1 text-3xl" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div
        className="rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p
          className="border-b px-5 py-4 text-xs font-semibold uppercase tracking-widest"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          Quick actions
        </p>
        <div className="flex flex-col">
          {actions.map(({ href, label, sub }, i) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/5"
              style={{
                borderTop: i > 0 ? `1px solid var(--border)` : undefined,
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
              </div>
              <svg
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--text-faint)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
