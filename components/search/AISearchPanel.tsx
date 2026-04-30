'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SearchResult {
  id: string
  title: string
  similarity: number
  created_at: string
}

interface SearchResponse {
  query: string
  answer: string
  results: SearchResult[]
  remainingSearches: number | null
}

interface Props {
  projectId: string
}

export default function AISearchPanel({ projectId }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, projectId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'エラーが発生しました')
        return
      }
      setResponse(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：デプロイ手順は？障害対応のフローを教えて"
            className="flex-1 border border-gray-300 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-4 rounded-2xl text-sm transition-colors shadow-sm"
          >
            {loading ? '...' : '検索'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">
          自然語で質問できます。AIがナレッジを検索して回答します。
        </p>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">AIがナレッジを検索中...</span>
          </div>
        </div>
      )}

      {/* Response */}
      {response && !loading && (
        <div className="space-y-6">
          {/* AI Answer */}
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🤖</span>
              <p className="font-bold text-blue-800 text-sm">AIの回答</p>
              {response.remainingSearches !== null && (
                <span className="ml-auto text-xs text-gray-400">
                  残り {response.remainingSearches} 回/月
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {response.answer}
            </p>
          </div>

          {/* Related Articles */}
          {response.results.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 text-sm mb-3">📄 関連する記事</p>
              <div className="space-y-2">
                {response.results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/projects/${projectId}/articles/${result.id}`}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        関連度: {Math.round(result.similarity * 100)}% ·{' '}
                        {formatDistanceToNow(new Date(result.created_at ?? Date.now()), { addSuffix: true, locale: ja })}
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-blue-400 ml-3">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !response && !error && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">質問を入力してください</p>
          <p className="text-sm mt-1">AIがナレッジベースから回答を生成します</p>
        </div>
      )}
    </div>
  )
}
