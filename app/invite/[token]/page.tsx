'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function InvitePage({ params }: { params: { token: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [result, setResult] = useState<'loading' | 'success' | 'error' | 'auth'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      setResult('auth')
      return
    }
    if (status !== 'authenticated') return

    const join = async () => {
      const res = await fetch(`/api/invites/${params.token}`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok && res.status !== 200) {
        setResult('error')
        setMessage(data.error ?? 'エラーが発生しました')
        return
      }

      if (data.projectId) {
        setResult('success')
        setTimeout(() => router.push(`/projects/${data.projectId}`), 1500)
      }
    }

    join()
  }, [status, params.token, router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center text-white">
        {result === 'loading' && <p>チームに参加中...</p>}
        {result === 'auth' && (
          <>
            <p className="text-xl font-bold mb-4">サインインが必要です</p>
            <Link
              href={`/login?callbackUrl=/invite/${params.token}`}
              className="bg-blue-500 text-white font-bold px-6 py-3 rounded-xl"
            >
              サインインして参加
            </Link>
          </>
        )}
        {result === 'success' && (
          <p className="text-xl font-bold text-green-400">チームに参加しました！</p>
        )}
        {result === 'error' && (
          <>
            <p className="text-red-400 font-bold mb-2">エラー</p>
            <p className="text-gray-400 text-sm">{message}</p>
            <Link href="/dashboard" className="text-blue-400 underline text-sm mt-4 block">
              ダッシュボードへ
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
