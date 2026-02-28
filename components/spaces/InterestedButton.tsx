'use client'

import { useState } from 'react'

export default function InterestedButton() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-800">Request sent!</p>
        <p className="mt-1 text-xs text-green-600">
          The owner will reach out to you shortly.
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={() => setSent(true)}
      className="w-full rounded-lg bg-[#1877F2] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166fe5]"
    >
      I&apos;m Interested
    </button>
  )
}
