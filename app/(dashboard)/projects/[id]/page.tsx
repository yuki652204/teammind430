import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function ProjectPage({ params }: { params: { id: string } }) {
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

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const { data: articles } = await db
    .from('articles')
    .select('id, title, tags, created_at, updated_at, users(name)')
    .eq('project_id', params.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
          )}
        </div>
        <Link
          href={`/projects/${params.id}/articles/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
        >
          + 新規記事
        </Link>
      </div>

      {/* AI Search shortcut */}
      <Link
        href={`/projects/${params.id}/search`}
        className="flex items-center gap-3 w-full bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-xl p-4 mb-6 hover:shadow-md transition-shadow group"
      >
        <span className="text-2xl">🔍</span>
        <div>
          <p className="font-bold text-blue-700 text-sm group-hover:text-blue-800">AI検索で質問する</p>
          <p className="text-blue-400 text-xs">自然語でナレッジを検索・回答取得</p>
        </div>
        <span className="ml-auto text-blue-400">→</span>
      </Link>

      {/* Articles */}
      {(articles?.length ?? 0) === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-bold text-gray-700 mb-1">まだ記事がありません</p>
          <p className="text-gray-400 text-sm mb-5">チームのナレッジを記録しましょう</p>
          <Link
            href={`/projects/${params.id}/articles/new`}
            className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            最初の記事を作成
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {articles!.map((article) => (
            <Link
              key={article.id}
              href={`/projects/${params.id}/articles/${article.id}`}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                  {article.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {article.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400">
                    {(article.users as any)?.name} ·{' '}
                    {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true, locale: ja })}
                  </span>
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-blue-400 ml-4">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
