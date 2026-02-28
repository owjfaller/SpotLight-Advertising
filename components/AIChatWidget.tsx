'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MOCK_SPACES } from '@/lib/mock/spaces'
import { formatPrice } from '@/lib/utils/formatters'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  "I'm launching a food brand in Chicago",
  'Best spaces under $500/mo in NYC',
  'Vehicle wraps vs billboards for B2C?',
]

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Billboard: { bg: '#dbeafe', text: '#1d4ed8' },
  Vehicle:   { bg: '#fef3c7', text: '#b45309' },
  Indoor:    { bg: '#dcfce7', text: '#15803d' },
  Outdoor:   { bg: '#e0f2fe', text: '#0369a1' },
  Digital:   { bg: '#f3e8ff', text: '#7e22ce' },
  Event:     { bg: '#fce7f3', text: '#be185d' },
}

// ── Parse assistant response into display text + picked listing IDs ──────────
function parseResponse(content: string): { text: string; pickedIds: string[] } {
  const picksMatch = content.split(/PICKS:/i)
  if (picksMatch.length < 2) {
    return { text: content.trim(), pickedIds: [] }
  }

  const textPart = picksMatch[0].trim()
  const picksPart = picksMatch[1]

  // Each line in picks section is a listing title
  const pickedIds = picksPart
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((title) => {
      const match = MOCK_SPACES.find(
        (s) => s.title.toLowerCase() === title.toLowerCase()
      )
      return match?.id ?? null
    })
    .filter((id): id is string => id !== null)

  return { text: textPart, pickedIds }
}

// ── Listing card ─────────────────────────────────────────────────────────────
function ListingCard({ spaceId }: { spaceId: string }) {
  const space = MOCK_SPACES.find((s) => s.id === spaceId)
  if (!space) return null

  const color = TYPE_COLORS[space.space_type] ?? { bg: '#f3f4f6', text: '#374151' }
  const imageUrl = `https://picsum.photos/seed/spotlight-${space.id}/120/80`

  return (
    <Link
      href={`/spaces/${space.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-[#e8a838] hover:shadow-md"
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={space.title}
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
      />
      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-900 group-hover:text-[#c47f10]">
          {space.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">{space.city}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{ background: color.bg, color: color.text }}
          >
            {space.space_type}
          </span>
          <span className="text-xs font-semibold text-[#e8a838]">
            {formatPrice(space.price_cents)}/mo
          </span>
        </div>
      </div>
      {/* Arrow */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#e8a838]"
      >
        <path
          fillRule="evenodd"
          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────
function SparkleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ── Main widget ──────────────────────────────────────────────────────────────
export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Something went wrong. Please try again.',
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const showStarters = messages.length === 0

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex w-80 flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{ height: 520, background: '#fff', border: '1px solid #e5e7eb' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3" style={{ background: '#0d1117' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: '#e8a838' }}><SparkleIcon /></span>
              <span className="text-sm font-semibold text-white">SpotLight AI Advisor</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 transition-colors hover:text-white">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: '#faf7f2' }}>
            {showStarters ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-xs text-gray-500 text-center pt-1">
                  Tell me about your brand and I&apos;ll find the best ad spaces for you.
                </p>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-[#e8a838]/40 bg-white px-3 py-2.5 text-left text-xs text-gray-700 transition-colors hover:border-[#e8a838] hover:bg-[#e8a838]/5"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((msg, i) => {
                if (msg.role === 'user') {
                  return (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#e8a838] px-3 py-2 text-xs text-white">
                        {msg.content}
                      </div>
                    </div>
                  )
                }

                // Assistant message
                const isStreaming = streaming && i === messages.length - 1
                const { text, pickedIds } = parseResponse(msg.content)

                return (
                  <div key={i} className="flex flex-col gap-2">
                    {/* Text bubble */}
                    <div className="rounded-2xl bg-white px-3 py-2.5 text-xs leading-relaxed text-gray-700 shadow-sm">
                      {msg.content === '' ? (
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
                          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
                          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
                        </span>
                      ) : (
                        text || msg.content
                      )}
                    </div>

                    {/* Listing cards — shown once streaming is done */}
                    {!isStreaming && pickedIds.length > 0 && (
                      <div className="space-y-2">
                        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Recommended spaces
                        </p>
                        {pickedIds.map((id) => (
                          <ListingCard key={id} spaceId={id} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-[#e8a838] focus-within:ring-1 focus-within:ring-[#e8a838]">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your brand or campaign…"
                disabled={streaming}
                className="flex-1 bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                style={{ color: '#e8a838' }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-4 py-3 font-semibold text-sm text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: '#e8a838' }}
      >
        <SparkleIcon />
        AI Advisor
      </button>
    </div>
  )
}
