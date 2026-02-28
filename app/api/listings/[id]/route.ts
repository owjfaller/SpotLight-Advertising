import { NextRequest, NextResponse } from 'next/server'
import { getSpaceById } from '@/lib/queries/spaces'
import { MOCK_SPACES } from '@/lib/mock/spaces'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let space = null
  try {
    space = await getSpaceById(params.id)
  } catch {
    // Supabase not configured — fall through to mock data
  }

  if (!space) {
    const mock = MOCK_SPACES.find(s => s.id === params.id)
    if (!mock) return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    return NextResponse.json(mock)
  }

  return NextResponse.json(space)
}
