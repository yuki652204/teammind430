import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import AISearchPanel from '@/components/search/AISearchPanel'

export default async function SearchPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const db = createServiceClient()
  const { data: membership } = await db
    .from('memberships')
    .select()
    .eq('user_id', session.user.id)
    .eq('project_id', params.id)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: project } = await db
    .from('projects')
    .select('name')
    .eq('id', params.id)
    .single()

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">AI検索</h1>
        <p className="text-gray-500 text-sm mt-1">
          {project?.name} のナレッジベースに質問する
        </p>
      </div>
      <AISearchPanel projectId={params.id} />
    </div>
  )
}
