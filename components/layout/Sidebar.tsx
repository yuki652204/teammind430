'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import clsx from 'clsx'

interface Project {
  id: string
  name: string
}

interface Props {
  projects: Project[]
  currentProjectId?: string
}

const navItems = (projectId: string) => [
  { href: `/projects/${projectId}`, label: '記事一覧', icon: '📄' },
  { href: `/projects/${projectId}/articles/new`, label: '新規作成', icon: '✏️' },
  { href: `/projects/${projectId}/members`, label: 'メンバー', icon: '👥' },
  { href: `/projects/${projectId}/settings`, label: '設定', icon: '⚙️' },
]

export default function Sidebar({ projects, currentProjectId }: Props) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-[260px] h-screen bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800">
        <Link href="/dashboard" className="font-black text-xl text-blue-600 dark:text-blue-400">
          TeamMind
        </Link>
      </div>

      {/* Search shortcut */}
      <Link
        href={currentProjectId ? `/projects/${currentProjectId}/search` : '/dashboard'}
        className="mx-3 my-3 flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-500 hover:border-blue-400 transition-colors"
      >
        <span>🔍</span>
        <span>AI検索...</span>
        <kbd className="ml-auto text-xs bg-gray-100 dark:bg-slate-700 px-1.5 rounded">⌘K</kbd>
      </Link>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          プロジェクト
        </p>
        <div className="space-y-1 mb-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentProjectId === p.id
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              )}
            >
              <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded text-xs flex items-center justify-center font-bold text-blue-600">
                {p.name[0].toUpperCase()}
              </span>
              <span className="truncate">{p.name}</span>
            </Link>
          ))}
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>+</span> プロジェクト追加
          </Link>
        </div>

        {/* Current project nav */}
        {currentProjectId && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2 mt-4">
              ナビゲーション
            </p>
            <div className="space-y-1">
              {navItems(currentProjectId).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User */}
      <div className="border-t border-gray-200 dark:border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ''}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.name?.[0] ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-400 hover:text-gray-600 text-xs"
            title="サインアウト"
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  )
}
