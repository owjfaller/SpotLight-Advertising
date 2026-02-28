import { createBrowserClient } from '@supabase/ssr'

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

  return createBrowserClient(url, key)
}
