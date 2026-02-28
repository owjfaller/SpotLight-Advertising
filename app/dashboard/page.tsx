'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/services/api'
import { Profile, AdSpace } from '@/lib/types/database.types'

export default function DashboardPage() {
  const [data, setData] = useState<{
    profile: Profile | null
    published: AdSpace[]
    interestedIn: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await api.getMyProfile()
        setData(res)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const profile = data?.profile
  const name = profile?.full_name || 'User'
  const email = profile?.email || ''

  const stats = [
    { label: 'Active listings', value: data?.published.length || 0, icon: '◈' },
    { label: 'Interests shown', value: data?.interestedIn.length || 0, icon: '◎' },
    { label: 'Messages', value: 0, icon: '◉' },
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
    <div className="mx-auto max-w-3xl px-4 py-8">

      {/* Header */}
      <div className="mb-4 rounded-2xl border p-6 shadow-sm" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
            style={{ background: 'rgba(24,119,242,0.1)', color: '#1877F2' }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg" style={{ color: '#111827' }}>Hey, {name}</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>{email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-2xl border p-5 text-center shadow-sm transition-transform hover:scale-[1.02]"
            style={{ background: '#fff', borderColor: '#e5e7eb' }}
          >
            <p className="text-xl" style={{ color: '#9ca3af' }}>{icon}</p>
            <p className="font-display mt-1 text-3xl font-bold" style={{ color: '#111827' }}>{value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-2xl border shadow-sm" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
        <p
          className="border-b px-5 py-4 text-xs font-semibold uppercase tracking-widest"
          style={{ borderColor: '#e5e7eb', color: '#9ca3af' }}
        >
          Quick actions
        </p>
        <div className="flex flex-col">
          {actions.map(({ href, label, sub }, i) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50 group"
              style={{ borderTop: i > 0 ? '1px solid #e5e7eb' : undefined }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-[#1877F2] transition-colors" style={{ color: '#111827' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{sub}</p>
              </div>
              <svg
                className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: '#9ca3af' }}
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
