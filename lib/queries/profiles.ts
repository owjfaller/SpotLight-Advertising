import { createClient } from '../supabase/server'
import { Profile } from '../types/database.types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as Profile
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'can_be_owner' | 'can_be_advertiser'>>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)

  return { error: error?.message ?? null }
}

export async function getUserInfo(userId: string): Promise<{
  published: Record<string, unknown>[] | null;
  interestedIn: Record<string, unknown>[] | null;
  error: string | null;
}> {
  const supabase = createClient()

  // 1. Get listings published by this user
  const { data: published, error: pubError } = await supabase
    .from('ad_spaces')
    .select('*')
    .eq('owner_id', userId)

  if (pubError) return { published: null, interestedIn: null, error: pubError.message }

  // 2. Get interests
  const { data: interestedIn, error: intError } = await supabase
    .from('ad_space_interests')
    .select(`
      created_at,
      ad_space_id,
      ad_spaces!inner (
        title,
        owner_id
      )
    `)
    .eq('user_id', userId)

  if (intError) return { published, interestedIn: null, error: intError.message }

  return { published, interestedIn, error: null }
}
