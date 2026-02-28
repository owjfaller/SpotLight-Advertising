import { createClient } from '@/lib/supabase/server'
import NavbarShell from './NavbarShell'

export default async function Navbar() {
  let user = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase not configured yet
  }

  return <NavbarShell user={user} />
}
