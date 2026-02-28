import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversations, startConversation } from '@/lib/queries/messages'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getConversations(user.id)
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { adSpaceId, sellerId } = await request.json()
  const { data, error } = await startConversation(adSpaceId, user.id, sellerId)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
