import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function ArticleDetailPage({
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

  if (!membership) notFound()

  const { data: article } = await db
    .from('articles')
    .select('*, users(id, name, avatar)')
    .eq('id', params.articleId)
    .eq('project_id', params.id)
    .single()

  if (!article) notFound()

  const canEdit =
    membership.role === 'admin' || (article.users as any)?.id === session.user.id

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/projects/${params.id}`} className="hover:text-gray-600">記事一覧</Link>
        <span>›</span>
        <span className="text-gray-600 truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-3">{article.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{(article.users as any)?.name}</span>
            <span>
              {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true, locale: ja })}に更新
            </span>
          </div>
          {canEdit && (
            <Link
              href={`/projects/${params.id}/articles/${params.articleId}/edit`}
              className="text-sm border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              編集
            </Link>
          )}
        </div>
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {article.tags.map((tag: string) => (
              <span key={tag} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
      </div>
    </div>
  )
}
