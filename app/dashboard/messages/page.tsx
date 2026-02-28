'use client'

import { useEffect, useState, useRef } from 'react'
import { api } from '@/lib/services/api'
import { Conversation, Message } from '@/lib/types/database.types'
import { createClient } from '@/lib/supabase/client'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [myId, setMyId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setMyId(user.id)
      
      try {
        const data = await api.getConversations()
        setConversations(data)
      } catch (err) {
        console.error('Failed to fetch conversations:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedId) return

    async function fetchMessages() {
      try {
        const data = await api.getMessages(selectedId!)
        setMessages(data)
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      }
    }

    fetchMessages()

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`conv-${selectedId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !selectedId || sending) return

    setSending(true)
    try {
      await api.sendMessage(selectedId, input.trim())
      setInput('')
    } catch (err) {
      console.error('Failed to send:', err)
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e8a838]"></div>
    </div>
  )

  const selectedConv = conversations.find(c => c.id === selectedId)

  return (
    <div className="flex h-[calc(100vh-56px)] bg-white overflow-hidden">
      
      {/* ── Sidebar ── */}
      <div className="w-80 border-right flex flex-col bg-[#faf7f2]" style={{ borderRight: '1px solid #e5e7eb' }}>
        <div className="p-4 border-bottom bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No conversations yet</div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.buyer_id === myId ? conv.seller : conv.buyer
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 text-left transition-colors border-bottom flex items-center gap-3 ${
                    selectedId === conv.id ? 'bg-[#e8a838]/10' : 'hover:bg-white'
                  }`}
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm">
                    {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{otherUser?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.ad_spaces?.title || 'Ad Space'}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Main Chat ── */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedId ? (
          <>
            <div className="p-4 border-bottom flex items-center gap-3 bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                 {(selectedConv?.buyer_id === myId ? selectedConv?.seller : selectedConv?.buyer)?.full_name?.[0]?.toUpperCase()}
               </div>
               <div>
                 <p className="font-bold text-sm">{(selectedConv?.buyer_id === myId ? selectedConv?.seller : selectedConv?.buyer)?.full_name}</p>
                 <p className="text-[10px] text-gray-400 uppercase tracking-wide">{selectedConv?.ad_spaces?.title}</p>
               </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fcfaf7]">
              {messages.map((msg) => {
                const isMine = msg.sender_id === myId
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMine ? 'bg-[#e8a838] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-top bg-white" style={{ borderTop: '1px solid #e5e7eb' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e8a838]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="bg-[#e8a838] text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[#cf9230] disabled:opacity-50"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#fcfaf7]">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

    </div>
  )
}
