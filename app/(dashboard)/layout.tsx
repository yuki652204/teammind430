import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const db = createServiceClient()
  const { data: memberships } = await db
    .from('memberships')
    .select('project_id, projects(id, name)')
    .eq('user_id', session.user.id)

  const projects = (memberships ?? []).map((m) => m.projects as { id: string; name: string })

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projects={projects} />
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        {children}
      </main>
    </div>
  )
}
