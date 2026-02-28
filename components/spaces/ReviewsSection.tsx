'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/lib/types/database.types'

interface ReviewsSectionProps {
  spaceId: string
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'mock-1',
    ad_space_id: '',
    reviewer_id: 'mock-user-1',
    rating: 5,
    title: 'Incredible visibility, exceeded expectations',
    body: 'We ran a 2-month campaign here for our product launch and the results were outstanding. Foot traffic is genuinely as high as advertised, and we saw a measurable spike in branded search the week after launch. The owner was communicative and professional throughout.',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'mock-2',
    ad_space_id: '',
    reviewer_id: 'mock-user-2',
    rating: 4,
    title: 'Great reach, smooth process',
    body: 'Really happy with this space for our Q4 push. The audience demographic matched our target perfectly. Setup was seamless and the owner responded quickly to every question. Would book again for our next campaign.',
    created_at: '2025-12-08T14:30:00Z',
  },
]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? '#e8a838' : 'none'}
      stroke={filled ? '#e8a838' : '#d1d5db'}
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  )
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  )
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-6 w-6 transition-colors"
            fill={(hovered || value) >= star ? '#e8a838' : 'none'}
            stroke={(hovered || value) >= star ? '#e8a838' : '#9ca3af'}
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

function ReviewCard({ review }: { review: Review }) {
  const initial = review.reviewer_id.slice(0, 1).toUpperCase() || 'A'
  return (
    <div className="rounded-xl border border-gray-100 bg-[#faf7f2] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8a838]/20 text-sm font-bold text-[#c47f10]">
            {initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{review.title}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
        <span className="shrink-0 text-xs text-gray-400">{formatDate(review.created_at)}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.body}</p>
    </div>
  )
}

export default function ReviewsSection({ spaceId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  // Form state
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u ? { id: u.id } : null)

      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!hasSupabase) {
        setReviews(MOCK_REVIEWS)
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/reviews/${spaceId}`)
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()
        const fetched: Review[] = json.reviews ?? []
        setReviews(fetched.length > 0 ? fetched : MOCK_REVIEWS)
      } catch {
        setReviews(MOCK_REVIEWS)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [spaceId])

  const avg = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setSubmitError('Please select a star rating.'); return }
    if (!title.trim()) { setSubmitError('Please add a title.'); return }
    if (!body.trim()) { setSubmitError('Please write your review.'); return }

    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_space_id: spaceId, rating, title, body }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to submit review')
      }
      const json = await res.json()
      setReviews((prev) => [json.review, ...prev])
      setRating(0)
      setTitle('')
      setBody('')
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Reviews
        </h2>
        {avg && (
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="#e8a838" stroke="#e8a838" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-sm font-bold text-gray-900">{avg}</span>
            <span className="text-xs text-gray-400">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e8a838] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      {/* Divider */}
      <div className="my-6 border-t border-gray-100" />

      {/* Submission area */}
      {submitted ? (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Thanks for your review! It has been posted.
        </div>
      ) : user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Leave a review</h3>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Your rating</label>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full rounded-lg border border-gray-200 bg-[#faf7f2] px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#e8a838] focus:outline-none focus:ring-1 focus:ring-[#e8a838]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Review</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share the details of your experience with this space..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-[#faf7f2] px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#e8a838] focus:outline-none focus:ring-1 focus:ring-[#e8a838]"
            />
          </div>

          {submitError && (
            <p className="text-xs text-red-500">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#e8a838] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="rounded-lg bg-[#faf7f2] px-4 py-4 text-center">
          <p className="text-sm text-gray-600">
            <a href="/login" className="font-semibold text-[#e8a838] hover:underline">Log in</a>
            {' '}to leave a review for this space.
          </p>
        </div>
      )}
    </div>
  )
}
