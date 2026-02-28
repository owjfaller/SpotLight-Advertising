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
    emoji: '📣',
  },
  {
    id: 'owner' as Role,
    title: 'Space owner',
    description: "I have surfaces or inventory I want to monetize.",
    emoji: '🏷️',
  },
  {
    id: 'both' as Role,
    title: 'Both',
    description: "I want to list spaces and find advertising opportunities.",
    emoji: '⚡',
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">How will you use SpotLight?</h1>
          <p className="mt-2 text-sm text-gray-500">You can change this anytime from your profile.</p>
        </div>

        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`flex items-start gap-4 rounded-xl border-2 p-5 text-left transition ${
                selected === role.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="mt-0.5 text-2xl">{role.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900">{role.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{role.description}</p>
              </div>
              <div
                className={`ml-auto mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                  selected === role.id
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
