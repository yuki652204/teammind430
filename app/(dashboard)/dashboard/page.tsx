import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!
  const db = createServiceClient()

  const { data: memberships } = await db
    .from('memberships')
    .select('role, projects(id, name, description, plan, created_at)')
    .eq('user_id', session!.user!.id)

  const projects = (memberships ?? []).map((m) => ({
    ...(m.projects as any),
    role: m.role,
  }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">ダッシュボード</h1>
          <p className="text-gray-500 text-sm mt-1">
            ようこそ、{session?.user?.name}さん
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + プロジェクト作成
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-6xl mb-4">📁</div>
          <p className="font-bold text-gray-700 text-lg mb-2">プロジェクトがありません</p>
          <p className="text-gray-400 text-sm mb-6">チームのナレッジベースを作成しましょう</p>
          <Link
            href="/projects/new"
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm"
          >
            最初のプロジェクトを作成
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600 text-lg">
                  {project.name[0].toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  {project.plan === 'pro' && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">Pro</span>
                  )}
                  {project.role === 'admin' && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">管理者</span>
                  )}
                </div>
              </div>
              <h2 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {project.name}
              </h2>
              {project.description && (
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{project.description}</p>
              )}
              <p className="text-gray-400 text-xs mt-3">
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: ja })}に作成
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
