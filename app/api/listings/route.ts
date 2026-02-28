import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCoordinates } from '@/lib/utils/geocode'
import { getFilteredAdSpaces, SpaceType } from '@/lib/queries/ad_spaces'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const filters = {
    low_price: searchParams.get('low_price') ? Number(searchParams.get('low_price')) : undefined,
    high_price: searchParams.get('high_price') ? Number(searchParams.get('high_price')) : undefined,
    type: searchParams.get('type') as SpaceType | undefined,
    city: searchParams.get('city') || undefined,
    radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined,
    user_lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
    user_lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
  }

  const { data, error } = await getFilteredAdSpaces(filters)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, type, location, city, start_date, end_date, price, description, image_url } = body

  if (!title || !type || !location || !city || !start_date || !end_date || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const coords = await getCoordinates(location)

  const { data, error } = await supabase
    .from('ad_spaces')
    .insert({
      title,
      owner_id: user.id,
      space_type: type as SpaceType,
      address: location,
      city,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      start_date,
      end_date,
      price_cents: Math.round(Number(price) * 100),
      description: description || null,
      image_url: image_url || null,
      status: 'published'
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}
