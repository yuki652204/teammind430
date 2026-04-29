import OpenAI from 'openai'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

export async function generateAnswer(
  query: string,
  context: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `あなたはチームのナレッジベースアシスタントです。
以下のナレッジ記事の内容を参考に、質問に日本語で簡潔に回答してください。
ナレッジに記載のない情報は「記録にありません」と答えてください。

ナレッジ:
${context}`,
      },
      { role: 'user', content: query },
    ],
    max_tokens: 500,
    temperature: 0.3,
  })
  return response.choices[0].message.content ?? '回答を生成できませんでした。'
}
