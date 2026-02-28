'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) return
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
      .upsert({ id: user.id, full_name: displayName.trim(), updated_at: new Date().toISOString() })

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
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
            What should we call you?
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            This is how your name will appear on your listings.
          </p>
        </div>

        <form onSubmit={handleContinue} className="flex flex-col gap-4">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Jane Smith or Acme Media Co."
            required
            autoFocus
            className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          />

          {error && (
            <p className="text-sm" style={{ color: '#ff6b6b' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={!displayName.trim() || loading}
            className="w-full rounded-lg py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#0d1117' }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
