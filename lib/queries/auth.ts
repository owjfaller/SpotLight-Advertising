import { createClient } from '../supabase/server'

export async function addUser(username: string, password: string): Promise<{ error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('users')
    .insert({
      username,
      password,
    })

  if (error) return { error: error.message }
  return { error: null }
}
