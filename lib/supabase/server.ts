import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '[SpotLight] Supabase environment variables are missing.\n' +
      'Add these to your .env.local file:\n\n' +
      '  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
      'Find them at: Supabase Dashboard → Project Settings → API'
    )
  }

  const cookieStore = cookies()

  return createServerClient(url, key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}
