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

export async function getUserInfo(username: string): Promise<{
  published: any[] | null;
  rentingTo: any[] | null;
  error: string | null;
}> {
  const supabase = createClient()

  // 1. Get listings published by this user
  const { data: published, error: pubError } = await supabase
    .from('listings')
    .select('*')
    .eq('owner', username)

  if (pubError) return { published: null, rentingTo: null, error: pubError.message }

  // 2. Get renters (listing_buyers) who are "renting" or interested in those listings
  // We use listings!inner to join and filter by the owner username
  const { data: rentingTo, error: rentError } = await supabase
    .from('listing_buyers')
    .select(`
      username,
      added_at,
      listing_id,
      listings!inner (
        title
      )
    `)
    .eq('listings.owner', username)

  if (rentError) return { published, rentingTo: null, error: rentError.message }

  return { published, rentingTo, error: null }
}
