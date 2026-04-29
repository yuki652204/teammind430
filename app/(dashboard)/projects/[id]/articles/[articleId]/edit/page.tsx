import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import ArticleEditor from '@/components/editor/ArticleEditor'

export default async function EditArticlePage({
  params,
}: {
  params: { id: string; articleId: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const db = createServiceClient()

  const { data: membership } = await db
    .from('memberships')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('project_id', params.id)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: article } = await db
    .from('articles')
    .select('id, title, body, tags, author_id')
    .eq('id', params.articleId)
    .single()

  if (!article) notFound()

  const canEdit = membership.role === 'admin' || article.author_id === session.user.id
  if (!canEdit) redirect(`/projects/${params.id}`)

  return (
    <ArticleEditor
      projectId={params.id}
      article={{ id: article.id, title: article.title, body: article.body, tags: article.tags }}
    />
  )
}
