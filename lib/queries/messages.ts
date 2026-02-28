import { createClient } from '../supabase/server'
import { Conversation, Message } from '../types/database.types'

export async function getConversations(userId: string): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = createClient()
  
  // Fetch conversations where user is buyer or seller
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      ad_spaces(title),
      buyer:profiles!buyer_id(full_name, avatar_url),
      seller:profiles!seller_id(full_name, avatar_url)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getMessages(conversationId: string): Promise<{ data: Message[] | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data as Message[], error: null }
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<{ data: Message | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Message, error: null }
}

export async function startConversation(adSpaceId: string, buyerId: string, sellerId: string): Promise<{ data: Conversation | null; error: string | null }> {
  const supabase = createClient()
  
  // Try to find existing first
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('ad_space_id', adSpaceId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .single()

  if (existing) return { data: existing as Conversation, error: null }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      ad_space_id: adSpaceId,
      buyer_id: buyerId,
      seller_id: sellerId
    })
    .select('*')
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Conversation, error: null }
}
