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
