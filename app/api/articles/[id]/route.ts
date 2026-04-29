import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { createEmbedding } from '@/lib/openai'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('articles')
    .select('*, users(id, name, avatar)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: membership } = await db
    .from('memberships')
    .select()
    .eq('user_id', session.user.id)
    .eq('project_id', data.project_id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createServiceClient()
  const { data: existing } = await db
    .from('articles')
    .select('project_id, title, body')
    .eq('id', params.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: membership } = await db
    .from('memberships')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('project_id', existing.project_id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updates: Record<string, unknown> = { ...parsed.data }

  if (parsed.data.title || parsed.data.body) {
    const title = parsed.data.title ?? existing.title
    const bodyText = parsed.data.body ?? existing.body
    updates.embedding = await createEmbedding(`${title}\n\n${bodyText}`)
  }

  const { data, error } = await db
    .from('articles')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: article } = await db
    .from('articles')
    .select('project_id, author_id')
    .eq('id', params.id)
    .single()

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: membership } = await db
    .from('memberships')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('project_id', article.project_id)
    .single()

  const canDelete =
    membership?.role === 'admin' || article.author_id === session.user.id

  if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.from('articles').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
