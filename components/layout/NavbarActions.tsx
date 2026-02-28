'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export default function NavbarActions({ user }: { user: User | null }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-white/5"
        style={{ color: 'var(--text-muted)' }}
      >
        Sign out
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-white/5"
        style={{ color: 'var(--text-muted)' }}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg px-4 py-2 text-sm font-semibold transition"
        style={{
          background: 'var(--accent)',
          color: '#0d1117',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
      >
        Sign up
      </Link>
    </div>
  )
}
