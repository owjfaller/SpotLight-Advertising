import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/dashboard/ProfileForm'

export default async function ProfilePage() {
  let userId = ''
  let displayName = ''
  let username = ''
  let memberSince = ''

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      userId = user.id
      username = user.email?.replace('@spotlight.local', '') ?? ''
      memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      displayName = profile?.display_name ?? username
    }
  } catch {
    // Supabase not configured
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#111827' }}>Profile</h1>
        <p className="mt-0.5 text-sm" style={{ color: '#6b7280' }}>Manage your account details.</p>
      </div>

      {/* Avatar + name header */}
      <div
        className="mb-6 flex items-center gap-4 rounded-2xl border p-5"
        style={{ background: '#fff', borderColor: '#e5e7eb' }}
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold"
          style={{ background: 'rgba(232,168,56,0.12)', color: '#e8a838' }}
        >
          {(displayName || username)[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold" style={{ color: '#111827' }}>{displayName || username}</p>
          <p className="text-sm" style={{ color: '#6b7280' }}>@{username}</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
        <ProfileForm
          userId={userId}
          initialDisplayName={displayName}
          username={username}
          memberSince={memberSince}
        />
      </div>
    </div>
  )
}
