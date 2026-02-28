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

// ── Detect listing mentions in assistant text ────────────────────────────────
function extractMentionedListings(text: string) {
  return MOCK_SPACES.filter((space) =>
    text.toLowerCase().includes(space.title.toLowerCase())
  )
}

// ── Simple markdown renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
    if (numberedMatch) {
      elements.push(
        <div key={key++} className="flex gap-1.5 mb-1">
          <span className="shrink-0 font-semibold text-[#c47f10]">{numberedMatch[1]}.</span>
          <span>{inlineMarkdown(numberedMatch[2])}</span>
        </div>
      )
      continue
    }

    // Bullet / recommendation line starting with → or -
    const bulletMatch = line.match(/^(→|-|\*)\s+(.+)/)
    if (bulletMatch) {
      const isRecommendation = bulletMatch[1] === '→'
      elements.push(
        <div key={key++} className={`flex gap-1.5 mb-1 ${isRecommendation ? 'mt-1' : ''}`}>
          <span className="shrink-0 text-[#e8a838]">{isRecommendation ? '→' : '•'}</span>
          <span>{inlineMarkdown(bulletMatch[2])}</span>
        </div>
      )
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={key++} className="mb-1 leading-snug">
        {inlineMarkdown(line)}
      </p>
    )
  }

  return elements
}

function inlineMarkdown(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// ── Listing card component ───────────────────────────────────────────────────
function ListingCard({ spaceId }: { spaceId: string }) {
  const space = MOCK_SPACES.find((s) => s.id === spaceId)
  if (!space) return null

  const typeColors: Record<string, string> = {
    Billboard: '#dbeafe',
    Vehicle: '#fef3c7',
    Indoor: '#dcfce7',
    Outdoor: '#e0f2fe',
    Digital: '#f3e8ff',
    Event: '#fce7f3',
  }
  const bg = typeColors[space.space_type] ?? '#f3f4f6'

  return (
    <Link
      href={`/spaces/${space.id}`}
      className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
        style={{ background: bg, color: '#374151' }}
      >
        {space.space_type.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-900">{space.title}</p>
        <p className="text-xs text-gray-400">{space.city} · {formatPrice(space.price_cents)}/mo</p>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e8a838" className="h-4 w-4 shrink-0">
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
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
          style={{ height: 500, background: '#fff', border: '1px solid #e5e7eb' }}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#faf7f2' }}>
            {showStarters ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-500 text-center">
                  Tell me about your brand and I&apos;ll find the best ad spaces for you.
                </p>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-[#e8a838]/40 bg-white px-3 py-2 text-left text-xs text-gray-700 transition-colors hover:border-[#e8a838] hover:bg-[#e8a838]/5"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((msg, i) => {
                const mentionedListings = msg.role === 'assistant' && msg.content
                  ? extractMentionedListings(msg.content)
                  : []

                return (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-xs ${
                        msg.role === 'user'
                          ? 'bg-[#e8a838] text-white'
                          : 'bg-white text-gray-700 shadow-sm'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        msg.content
                      ) : msg.content ? (
                        renderMarkdown(msg.content)
                      ) : (
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
                          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
                          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
                        </span>
                      )}
                    </div>

                    {/* Listing cards — only show when streaming is done */}
                    {msg.role === 'assistant' && !streaming && mentionedListings.length > 0 && (
                      <div className="mt-1 w-full space-y-1">
                        {mentionedListings.map((space) => (
                          <ListingCard key={space.id} spaceId={space.id} />
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
