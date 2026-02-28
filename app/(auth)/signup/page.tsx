'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const fakeEmail = `${username.trim().toLowerCase()}@spotlight.local`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({ id: data.user.id, display_name: username.trim() })
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)]" style={{ background: 'var(--bg)' }}>

      {/* Left brand panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 rounded-full opacity-10"
          style={{ width: 500, height: 500, background: 'var(--accent)' }}
        />
        <div
          className="pointer-events-none absolute -top-24 -left-24 rounded-full border opacity-10"
          style={{ width: 400, height: 400, borderColor: 'var(--accent)' }}
        />

        <Link href="/" className="font-display text-3xl relative z-10" style={{ color: 'var(--accent)' }}>
          SpotLight
        </Link>

        <div className="relative z-10">
          <p className="font-display text-4xl leading-snug" style={{ color: 'var(--text)' }}>
            Your space.<br />Someone&apos;s next<br />big campaign.
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Join free. List your space in minutes or start browsing thousands of unconventional ad surfaces.
          </p>
        </div>

        <p className="text-xs relative z-10" style={{ color: 'var(--text-faint)' }}>
          © {new Date().getFullYear()} SpotLight
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display mb-8 block text-2xl md:hidden" style={{ color: 'var(--accent)' }}>
            SpotLight
          </Link>

          <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>Create account</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Free forever. No credit card needed.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Username"
              className="w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Password (min 8 characters)"
              className="w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />

            {error && (
              <p
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0d1117' }}
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold transition hover:opacity-80" style={{ color: 'var(--accent)' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
