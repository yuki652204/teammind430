'use client'

import { useState } from 'react'

export default function InviteCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={url}
        readOnly
        className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-600 truncate"
      />
      <button
        onClick={handleCopy}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
      >
        {copied ? '✓ コピー済み' : 'コピー'}
      </button>
    </div>
  )
}
