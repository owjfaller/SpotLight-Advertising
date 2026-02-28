'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  userId: string
  initialDisplayName: string
  username: string
  memberSince: string
}

export default function ProfileForm({ userId, initialDisplayName, username, memberSince }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase
      .from('profiles')
      .upsert({ id: userId, display_name: displayName.trim() })

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Username — read-only */}
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: '#374151' }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          disabled
          className="w-full rounded-lg border px-4 py-2.5 text-sm"
          style={{ background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }}
        />
        <p className="mt-1 text-xs" style={{ color: '#9ca3af' }}>Used to log in. Cannot be changed.</p>
      </div>

      {/* Display name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: '#374151' }}>
          Display name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={50}
          placeholder="Your name"
          className="w-full rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2"
          style={{
            background: '#fff',
            borderColor: '#e5e7eb',
            color: '#111827',
          }}
        />
        <p className="mt-1 text-xs" style={{ color: '#9ca3af' }}>Shown on your listings and profile.</p>
      </div>

      {/* Member since — read-only */}
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: '#374151' }}>
          Member since
        </label>
        <input
          type="text"
          value={memberSince}
          disabled
          className="w-full rounded-lg border px-4 py-2.5 text-sm"
          style={{ background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }}
        />
      </div>

      {error && (
        <p className="rounded-lg px-3 py-2 text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || displayName.trim() === initialDisplayName}
        className="rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
        style={{ background: '#e8a838', color: '#0d1117' }}
      >
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
      </button>
    </form>
  )
}
