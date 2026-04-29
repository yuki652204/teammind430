'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  params: { id: string }
}

export default function ProjectSettingsPage({ params }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('プロジェクトを削除しました')
        router.push('/dashboard')
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'エラーが発生しました')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">プロジェクト設定</h1>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-2xl p-6">
        <h2 className="font-bold text-red-700 mb-1">危険ゾーン</h2>
        <p className="text-gray-500 text-sm mb-4">
          プロジェクトを削除すると、すべての記事・検索ログが完全に削除されます。この操作は元に戻せません。
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder='確認のため "DELETE" と入力'
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleDelete}
          disabled={confirmText !== 'DELETE' || deleting}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          {deleting ? '削除中...' : 'プロジェクトを削除'}
        </button>
      </div>
    </div>
  )
}
