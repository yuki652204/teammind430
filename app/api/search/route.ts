import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { createEmbedding, generateAnswer } from '@/lib/openai'
import { canSearch, logSearch } from '@/lib/usage'
import { z } from 'zod'

const schema = z.object({
  query: z.string().min(1).max(500),
  projectId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { query, projectId } = parsed.data
  const db = createServiceClient()

  const { data: project } = await db
    .from('projects')
    .select('plan')
    .eq('id', projectId)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: membership } = await db
    .from('memberships')
    .select()
    .eq('user_id', session.user.id)
    .eq('project_id', projectId)
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { allowed, remaining } = await canSearch(session.user.id, projectId, project.plan)
  if (!allowed) {
    return NextResponse.json(
      { error: 'AI search limit reached. Upgrade to Pro for unlimited searches.' },
      { status: 429 }
    )
  }

  const embedding = await createEmbedding(query)

  const { data: results, error } = await db.rpc('match_articles', {
    query_embedding: embedding,
    match_project_id: projectId,
    match_count: 3,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const context = (results ?? [])
    .map((r: any) => `## ${r.title}\n${r.body.slice(0, 800)}`)
    .join('\n\n---\n\n')

  const answer = context
    ? await generateAnswer(query, context)
    : 'まだナレッジが登録されていません。記事を追加してください。'

  await logSearch(query, session.user.id, projectId)

  return NextResponse.json({
    query,
    answer,
    results: results ?? [],
    remainingSearches: remaining === Infinity ? null : remaining - 1,
  })
}
