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
    { label: 'Active listings', value: '—', emoji: '📋' },
    { label: 'Open inquiries', value: '—', emoji: '💬' },
    { label: 'Unread messages', value: '—', emoji: '✉️' },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-5 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-xl font-bold text-white">
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">Hey, {name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        {profile && (
          <div className="mt-3 flex gap-2">
            {profile.can_be_owner && (
              <span className="rounded-full bg-[#e7f3ff] px-3 py-0.5 text-xs font-medium text-[#1877F2]">
                Space owner
              </span>
            )}
            {profile.can_be_advertiser && (
              <span className="rounded-full bg-[#e6f4ea] px-3 py-0.5 text-xs font-medium text-green-700">
                Advertiser
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, emoji }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm text-center">
            <p className="text-2xl">{emoji}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900">Quick actions</h2>
        <div className="flex flex-col gap-2">
          {[
            {
              href: '/spaces/new',
              label: 'Create a new listing',
              sub: 'Publish an ad space to the marketplace',
              emoji: '➕',
              show: profile?.can_be_owner ?? true,
            },
            {
              href: '/dashboard/listings',
              label: 'Manage your listings',
              sub: 'Edit, pause, or delete your spaces',
              emoji: '📋',
              show: profile?.can_be_owner ?? true,
            },
            {
              href: '/spaces',
              label: 'Browse ad spaces',
              sub: 'Find the right surface for your campaign',
              emoji: '🔍',
              show: profile?.can_be_advertiser ?? true,
            },
            {
              href: '/dashboard/inquiries',
              label: 'View inquiries',
              sub: 'See all booking requests and messages',
              emoji: '💬',
              show: true,
            },
          ]
            .filter((l) => l.show)
            .map(({ href, label, sub, emoji }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 rounded-lg p-3 hover:bg-[#f0f2f5] transition"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f2f5] text-xl">
                  {emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
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
