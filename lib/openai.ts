import OpenAI from 'openai'

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.')
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

export async function generateAnswer(
  query: string,
  context: string
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
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
