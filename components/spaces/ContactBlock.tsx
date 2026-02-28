'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/services/api'
import { Conversation } from '@/lib/types/database.types'

interface ContactBlockProps {
  spaceId: string
  listingTitle: string
  ownerName: string
  ownerId: string
}

interface MessageDisplay {
  text: string
  sender: 'user' | 'bot' | 'owner'
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

export default function ContactBlock({ spaceId, listingTitle, ownerName, ownerId }: ContactBlockProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [phase,    setPhase]    = useState<'presets' | 'chat'>('presets')
  const [messages, setMessages] = useState<MessageDisplay[]>([])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)

  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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

  async function ensureConversation(): Promise<Conversation | null> {
    if (conversation) return conversation
    try {
      const conv = await api.startConversation(spaceId, ownerId)
      setConversation(conv)
      return conv
    } catch (err) {
      console.error('Failed to start conversation:', err)
      return null
    }
  }

  async function selectPreset(id: string, label: string) {
    if (id === 'question') {
      setPhase('chat')
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    setSending(true)
    const conv = await ensureConversation()
    if (!conv) {
      setSending(false)
      return
    }

    try {
      await api.sendMessage(conv.id, label)
      setMessages([{ text: label, sender: 'user' }])
      setPhase('chat')

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: `Thanks for reaching out! ${ownerName} has been notified and will get back to you within 24 hours.`,
            sender: 'bot',
          },
        ])
      }, 700)
    } catch (err) {
      console.error('Failed to send preset:', err)
    } finally {
      setSending(false)
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || sending) return
    
    setSending(true)
    const conv = await ensureConversation()
    if (!conv) {
      setSending(false)
      return
    }

    try {
      await api.sendMessage(conv.id, text)
      setMessages((prev) => [...prev, { text, sender: 'user' }])
      setInput('')
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: `${ownerName} has been notified and will respond shortly.`,
            sender: 'bot',
          },
        ])
      }, 800)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={openChat}
        className="w-full rounded-lg bg-[#e8a838] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#cf9230]"
      >
        Contact Owner
      </button>

      {chatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setChatOpen(false) }}
        >
          <div className="flex w-full max-h-[80vh] flex-col rounded-t-2xl bg-white sm:max-w-md sm:rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-gray-900">Message {ownerName}</p>
                <p className="truncate text-xs text-gray-400">{listingTitle}</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {phase === 'presets' ? (
              <div className="flex flex-col gap-3 p-5">
                <p className="text-sm font-medium text-gray-700">How would you like to start?</p>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    disabled={sending}
                    onClick={() => selectPreset(p.id, p.label)}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-left text-sm font-medium text-gray-800 transition-colors hover:border-[#e8a838] hover:bg-amber-50 hover:text-[#e8a838] disabled:opacity-50"
                  >
                    <span className="text-[#e8a838]">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-5">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === 'user' ? 'rounded-br-sm bg-[#e8a838] text-white' : 'rounded-bl-sm bg-gray-100 text-gray-800'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

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
                    className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e8a838]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="shrink-0 rounded-xl bg-[#e8a838] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#cf9230] disabled:opacity-40"
                  >
                    {sending ? '...' : 'Send'}
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
