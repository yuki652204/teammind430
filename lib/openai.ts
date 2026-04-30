export async function createEmbedding(text: string): Promise<number[]> {
  // Embedding不使用のため空配列を返す（全文検索に切り替え）
  return []
}

export async function generateAnswer(
  query: string,
  context: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured.')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `あなたはチームのナレッジベースアシスタントです。以下のナレッジ記事を参考に、質問に日本語で簡潔に回答してください。ナレッジに記載のない情報は「記録にありません」と答えてください。

ナレッジ:
${context}

質問: ${query}`,
        },
      ],
    }),
  })

  const data = await response.json()
  return data.content?.[0]?.text ?? '回答を生成できませんでした。'
}
