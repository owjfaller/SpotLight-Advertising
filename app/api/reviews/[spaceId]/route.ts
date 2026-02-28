import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { spaceId: string } }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('ad_space_id', params.spaceId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ reviews: data ?? [] })
}
