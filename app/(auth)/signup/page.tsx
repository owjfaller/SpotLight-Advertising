'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const hasSupabase = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('your_')
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasSupabase) {
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
        data: { display_name: displayName.trim() },
      },
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered') || signUpError.message.toLowerCase().includes('already been registered')) {
        setError('already_registered')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    // If session is null, Supabase sent a confirmation email
    if (!data.session) {
      setConfirmed(true)
      return
    }

    // Email confirmation disabled — session created immediately
    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({ id: data.user.id, display_name: displayName.trim(), email: email.trim() })
    }
    window.location.href = '/onboarding'
  }

  const brandPanel = (
    <div
      className="hidden md:flex md:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      <div className="pointer-events-none absolute -bottom-32 -right-32 rounded-full opacity-10"
        style={{ width: 500, height: 500, background: 'var(--accent)' }} />
      <div className="pointer-events-none absolute -top-24 -left-24 rounded-full border opacity-10"
        style={{ width: 400, height: 400, borderColor: 'var(--accent)' }} />
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
  )

  // ── Confirmation screen ──────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="flex min-h-[calc(100vh-56px)]" style={{ background: 'var(--bg)' }}>
        {brandPanel}
        <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
          <div className="w-full max-w-sm text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(232,168,56,0.12)' }}
            >
              <svg className="h-8 w-8" fill="none" stroke="#e8a838" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl" style={{ color: 'var(--text)' }}>Check your inbox</h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We sent a confirmation link to{' '}
              <span className="font-semibold" style={{ color: 'var(--text)' }}>{email}</span>.
              <br />Click it to activate your account.
            </p>
            <p className="mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => setConfirmed(false)}
                className="font-semibold hover:opacity-80 transition"
                style={{ color: 'var(--accent)' }}
              >
                try again
              </button>
              .
            </p>
            <Link
              href="/login"
              className="mt-8 block text-sm font-medium transition hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              ← Back to log in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Sign-up form ─────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-56px)]" style={{ background: 'var(--bg)' }}>
      {brandPanel}

      <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display mb-8 block text-2xl md:hidden" style={{ color: 'var(--accent)' }}>
            SpotLight
          </Link>

          <h1 className="font-display text-3xl" style={{ color: 'var(--text)' }}>Create account</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Free forever. No credit card needed.
          </p>

          {!hasSupabase && (
            <div className="mt-4 rounded-lg px-3 py-2.5 text-sm" style={{ background: 'rgba(255,170,0,0.1)', color: '#b45309' }}>
              <strong>Setup required:</strong> Add your Supabase credentials to <code className="text-xs">.env.local</code> to enable sign-up.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Display name"
              className="w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Email address"
              className="w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
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
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />

            {error && (
              <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b' }}>
                {error === 'already_registered' ? (
                  <>This email is already registered.{' '}
                    <Link href="/login" className="font-semibold underline">Log in instead</Link>
                    {' '}or reset your password.
                  </>
                ) : error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !hasSupabase}
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
