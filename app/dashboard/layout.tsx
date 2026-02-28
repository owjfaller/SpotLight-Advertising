import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/login')

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-[calc(100vh-56px)]" style={{ background: '#f9fafb' }}>
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 md:block" style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}>
        <DashboardNav />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
