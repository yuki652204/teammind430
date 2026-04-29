import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import ArticleEditor from '@/components/editor/ArticleEditor'

export default async function NewArticlePage({ params }: { params: { id: string } }) {
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

  return <ArticleEditor projectId={params.id} />
}
