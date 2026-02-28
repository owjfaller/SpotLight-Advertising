'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
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
    const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/callback` },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)]" style={{ background: 'var(--bg)' }}>

      {/* Left brand panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        {/* Decorative circle */}
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 rounded-full opacity-10"
          style={{ width: 500, height: 500, background: 'var(--accent)' }}
        />
        <div
          className="pointer-events-none absolute -top-24 -right-24 rounded-full border opacity-10"
          style={{ width: 400, height: 400, borderColor: 'var(--accent)' }}
        />

        <Link href="/" className="font-display text-3xl relative z-10" style={{ color: 'var(--accent)' }}>
          SpotLight
        </Link>

        <div className="relative z-10">
          <p className="font-display text-4xl leading-snug" style={{ color: 'var(--text)' }}>
            Every blank wall<br />is an opportunity.
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Thousands of advertisers and space owners connect here every day.
          </p>
        </div>

        <p className="text-xs relative z-10" style={{ color: 'var(--text-faint)' }}>
          © {new Date().getFullYear()} SpotLight
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="font-display mb-8 block text-2xl md:hidden" style={{ color: 'var(--accent)' }}>
            SpotLight
          </Link>

          <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Log in to your account to continue.
          </p>

          {message && (
            <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(232,168,56,0.1)', color: 'var(--accent)' }}>
              {message}
            </p>
          )}

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
              autoComplete="current-password"
              placeholder="Password"
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
              {loading ? 'Logging in…' : 'Log in'}
            </button>

            <p
              className="text-center text-sm font-medium cursor-pointer hover:opacity-80 transition"
              style={{ color: 'var(--text-muted)' }}
            >
              Forgot password?
            </p>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or</span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold transition hover:opacity-80" style={{ color: 'var(--accent)' }}>
              Sign up free
            </Link>
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or</span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <Link
            href="/spaces/new"
            className="mt-4 block w-full rounded-lg border py-3 text-center text-sm font-medium transition hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Continue without logging in
          </Link>
        </div>
      </div>
    </div>
  )
}
