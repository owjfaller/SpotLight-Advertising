'use client'

import { useState } from 'react'
import { api } from '@/lib/services/api'

interface InterestedButtonProps {
  spaceId: string
}

export default function InterestedButton({ spaceId }: InterestedButtonProps) {
  const [loading, setLoading] = useState(false)
  const [interested, setInterested] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInterest() {
    setLoading(true)
    setError(null)
    try {
      await api.expressInterest(spaceId)
      setInterested(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to express interest')
    } finally {
      setLoading(false)
    }
  }

  if (interested) {
    return (
      <div className="w-full rounded-lg bg-green-500 py-3 text-center text-sm font-semibold text-white">
        ✓ Interested
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleInterest}
        disabled={loading}
        className="w-full rounded-lg bg-[#1877F2] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166fe5] disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'I am interested'}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  )
}
