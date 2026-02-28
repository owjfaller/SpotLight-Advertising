'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/services/api'
import { SpaceType } from '@/lib/types/database.types'

const SPACE_TYPES: SpaceType[] = ['Billboard', 'Vehicle', 'Indoor', 'Outdoor', 'Digital', 'Event', 'Other']

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title:       '',
    type:        '' as SpaceType | '',
    location:    '',
    city:        '',
    start_date:  '',
    end_date:    '',
    price:       '',
    description: '',
  })

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setImagePreview(URL.createObjectURL(file))

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('space-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Image upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('space-images').getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setUploading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await api.createListing({
        ...form,
        type: form.type as SpaceType,
        price: Number(form.price),
        image_url: imageUrl || undefined,
      })
      router.push(`/spaces/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#fff',
    borderColor: '#e5e7eb',
    color: '#111827',
  }

  const labelStyle = { color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#f5f5f5' }}>
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-100"
            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#111827' }}>
            Create a listing
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>
            Fill in the details below to publish your ad space.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border divide-y" style={{ background: '#fff', borderColor: '#e5e7eb' }}>

            {/* Title */}
            <div className="p-6 flex flex-col gap-2">
              <label style={labelStyle}>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Downtown Billboard on 5th Ave"
                className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Type */}
            <div className="p-6 flex flex-col gap-2">
              <label style={labelStyle}>Space type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="" disabled>Select a type…</option>
                {SPACE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>Address</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 123 Main St, New York, NY"
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label style={labelStyle}>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g. New York"
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="p-6 flex flex-col gap-2">
              <label style={labelStyle}>Availability window</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Start date</span>
                  <input
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs" style={{ color: '#9ca3af' }}>End date</span>
                  <input
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="p-6 flex flex-col gap-2">
              <label style={labelStyle}>Monthly price (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9ca3af' }}>$</span>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="1500"
                  className="w-full rounded-lg border py-3 pl-8 pr-4 text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Image */}
            <div className="p-6 flex flex-col gap-3">
              <label style={labelStyle}>Photo <span style={{ color: '#9ca3af', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>

              {imagePreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <p className="text-sm font-medium text-white">Uploading…</p>
                    </div>
                  )}
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageUrl(null) }}
                      className="absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <label
                  className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition hover:bg-gray-50"
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <svg className="h-8 w-8" style={{ color: '#d1d5db' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm" style={{ color: '#6b7280' }}>Click to upload a photo</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>JPG, PNG, WEBP up to 10MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* Description */}
            <div className="p-6 flex flex-col gap-2">
              <label style={labelStyle}>Description <span style={{ color: '#9ca3af', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your space — foot traffic, visibility, dimensions, any restrictions…"
                className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none resize-none"
                style={inputStyle}
              />
            </div>

          </div>

          {error && (
            <p className="mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(255,80,80,0.1)', color: '#ef4444' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg py-3.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{ background: '#e8a838', color: '#0d1117' }}
          >
            {loading ? 'Publishing…' : 'Publish listing'}
          </button>
        </form>

      </div>
    </div>
  )
}
