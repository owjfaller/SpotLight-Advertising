import { NextRequest, NextResponse } from 'next/server'
import { getSpaceById } from '@/lib/queries/spaces'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const space = await getSpaceById(params.id)
  
  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }

  return NextResponse.json(space)
}
