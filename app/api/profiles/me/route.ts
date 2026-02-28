import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserInfo, getProfile } from '@/lib/queries/profiles'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [profile, userInfo] = await Promise.all([
    getProfile(user.id),
    getUserInfo(user.id)
  ])

  if (userInfo.error) {
    return NextResponse.json({ error: userInfo.error }, { status: 500 })
  }

  return NextResponse.json({
    profile,
    published: userInfo.published,
    interestedIn: userInfo.interestedIn
  })
}
