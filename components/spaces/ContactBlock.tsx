'use client'

import { useState, useRef, useEffect } from 'react'

interface ContactBlockProps {
  listingTitle: string
  ownerName: string
  minDuration: string
  availability: string
}

interface Message {
  text: string
  sender: 'user' | 'bot'
}

const PRESETS = [
  {
    id: 'reserve',
    label: 'I want to reserve it!',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'offer',
    label: 'I have an offer',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'question',
    label: 'Ask a specific question',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
] as const

function calcDuration(start: string, end: string): string {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  if (e <= s) return ''
  const totalDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  if (months < 1) return `${totalDays} day${totalDays === 1 ? '' : 's'}`
  const remainDays = totalDays - months * 30
  return remainDays > 0
    ? `${months} month${months === 1 ? '' : 's'} + ${remainDays} day${remainDays === 1 ? '' : 's'}`
    : `${months} month${months === 1 ? '' : 's'}`
}

const today = new Date().toISOString().split('T')[0]

export default function ContactBlock({
  listingTitle,
  ownerName,
  minDuration,
  availability,
}: ContactBlockProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [chatOpen,  setChatOpen]  = useState(false)
  const [phase,     setPhase]     = useState<'presets' | 'chat'>('presets')
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [sending,   setSending]   = useState(false)

  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const duration = calcDuration(startDate, endDate)

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = chatOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [chatOpen])

  function openChat() {
    setPhase('presets')
    setMessages([])
    setInput('')
    setChatOpen(true)
  }

  function selectPreset(id: string, label: string) {
    if (id === 'question') {
      setPhase('chat')
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    const dateNote =
      startDate && endDate
        ? ` — Campaign: ${startDate} to ${endDate}${duration ? ` (${duration})` : ''}.`
        : ''
    const userMsg = `${label}${dateNote}`

    setMessages([{ text: userMsg, sender: 'user' }])
    setPhase('chat')

    // Simulate owner acknowledgement
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: `Thanks for reaching out! ${ownerName} has been notified and will get back to you within 24 hours.`,
          sender: 'bot',
        },
      ])
    }, 700)
  }

  function sendMessage() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages((prev) => [...prev, { text, sender: 'user' }])
    setSending(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: `${ownerName} has been notified and will respond shortly.`,
          sender: 'bot',
        },
      ])
      setSending(false)
    }, 800)
  }

  return (
    <>
      {/* ── Campaign date range ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Start date</label>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => {
                setStartDate(e.target.value)
                if (endDate && e.target.value > endDate) setEndDate('')
              }}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">End date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
            />
          </div>
        </div>

        {/* Live duration + owner constraint */}
        <div className="flex items-center justify-between text-xs">
          {duration ? (
            <span className="font-semibold text-[#1877F2]">Duration: {duration}</span>
          ) : (
            <span className="text-gray-400">Select your campaign dates</span>
          )}
          <span className="text-gray-400">{minDuration} min.</span>
        </div>
        <p className="text-xs text-gray-400">Availability: {availability}</p>
      </div>

      {/* ── CTA button ─────────────────────────────────────── */}
      <button
        onClick={openChat}
        className="w-full rounded-lg bg-[#1877F2] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166fe5]"
      >
        I&apos;m Interested
      </button>

      {/* ── Chat modal ─────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setChatOpen(false) }}
        >
          <div className="flex w-full max-h-[80vh] flex-col rounded-t-2xl bg-white sm:max-w-md sm:rounded-2xl">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-gray-900">Message {ownerName}</p>
                <p className="truncate text-xs text-gray-400">{listingTitle}</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {phase === 'presets' ? (
              /* ── Preset options ── */
              <div className="flex flex-col gap-3 p-5">
                <p className="text-sm font-medium text-gray-700">How would you like to start?</p>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPreset(p.id, p.label)}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-left text-sm font-medium text-gray-800 transition-colors hover:border-[#1877F2] hover:bg-blue-50 hover:text-[#1877F2]"
                  >
                    <span className="text-[#1877F2]">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              /* ── Chat view ── */
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto space-y-3 p-5"
                >
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-gray-400">
                      Type your question below
                    </p>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'rounded-br-sm bg-[#1877F2] text-white'
                            : 'rounded-bl-sm bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input bar */}
                <div className="flex shrink-0 items-end gap-2 border-t border-gray-100 p-4">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type a message…"
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="shrink-0 rounded-xl bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166fe5] disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
