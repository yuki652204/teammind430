'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  projectId: string
  article?: { id: string; title: string; body: string; tags: string[] }
}

export default function ArticleEditor({ projectId, article }: Props) {
  const router = useRouter()
  const isEdit = !!article
  const [title, setTitle] = useState(article?.title ?? '')
  const [body, setBody] = useState(article?.body ?? '')
  const [tagInput, setTagInput] = useState(article?.tags.join(', ') ?? '')
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)

    try {
      const url = isEdit ? `/api/articles/${article.id}` : '/api/articles'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, tags, projectId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'エラーが発生しました')
        return
      }
      toast.success(isEdit ? '更新しました' : '記事を作成しました')
      router.push(`/projects/${projectId}/articles/${data.id}`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {isEdit ? '記事を編集' : '新しい記事'}
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-sm border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {preview ? '編集に戻る' : 'プレビュー'}
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            {loading ? '保存中...' : isEdit ? '更新する' : '公開する'}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="記事タイトル"
        required
        className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 mb-6 focus:outline-none focus:border-blue-500 bg-transparent placeholder-gray-300"
      />

      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="タグ（カンマ区切り）例: インフラ, AWS, セキュリティ"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {preview ? (
        <div className="prose max-w-none border border-gray-200 rounded-xl p-6 min-h-64 bg-gray-50">
          <pre className="whitespace-pre-wrap font-sans text-sm">{body || '本文がありません'}</pre>
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`# 見出し\n\nMarkdownで記事を書いてください。\n\n## セクション\n\nテキストをここに入力...`}
          rows={24}
          className="w-full border border-gray-200 rounded-xl px-5 py-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
        />
      )}

      <p className="text-xs text-gray-400 mt-3">
        💡 Markdownが使えます。保存時にAIが自動でベクトル化し、AI検索に反映されます。
      </p>
    </form>
  )
}
