import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCoordinates } from '@/lib/utils/geocode'

export async function POST(request: NextRequest) {
  const supabase = createClient()

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('ad_spaces')
    .insert({
      title,
      owner: profile?.display_name ?? null,
      space_type: type,
      location_address: location,
      city,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      start_date,
      end_date,
      price_cents: Math.round(Number(price) * 100),
      description: description || null,
      image_url: image_url || null,
      status: 'published',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}
