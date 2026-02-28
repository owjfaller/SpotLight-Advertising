'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'owner' | 'advertiser' | 'both'

const roles = [
  {
    id: 'advertiser' as Role,
    title: 'Advertiser',
    description: "I'm looking to book ad space for my brand or campaign.",
    icon: '📣',
  },
  {
    id: 'owner' as Role,
    title: 'Space owner',
    description: "I have surfaces or inventory I want to monetize.",
    icon: '🏷️',
  },
  {
    id: 'both' as Role,
    title: 'Both',
    description: "I want to list spaces and find advertising opportunities.",
    icon: '⚡',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        can_be_owner: selected === 'owner' || selected === 'both',
        can_be_advertiser: selected === 'advertiser' || selected === 'both',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div
      className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
            How will you use SpotLight?
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            You can change this anytime from your profile.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {roles.map((role) => {
            const isSelected = selected === role.id
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className="flex items-center gap-4 rounded-xl border p-5 text-left transition"
                style={{
                  background: isSelected ? 'rgba(232,168,56,0.08)' : 'var(--surface)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <span className="mt-0.5 text-2xl">{role.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{role.title}</p>
                  <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>{role.description}</p>
                </div>
                <div
                  className="ml-auto mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition"
                  style={{
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                  }}
                />
              </button>
            )
          })}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm" style={{ color: '#ff6b6b' }}>{error}</p>
        )}

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="mt-6 w-full rounded-lg py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#0d1117' }}
        >
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
