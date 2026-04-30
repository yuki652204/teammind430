import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/types'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string(),
  tags: z.array(z.string()).default([]),
  projectId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const db = createServiceClient()

  const { data: membership } = await db
    .from('memberships')
    .select()
    .eq('user_id', session.user.id)
    .eq('project_id', projectId)
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await db
    .from('articles')
    .select('id, title, body, tags, author_id, created_at, updated_at, users(name, avatar)')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createServiceClient()

  const { data: project } = await db
    .from('projects')
    .select('plan')
    .eq('id', parsed.data.projectId)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { count } = await db
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', parsed.data.projectId)

  const limit = PLAN_LIMITS[project.plan as 'free' | 'pro'].articles
  if (limit !== Infinity && (count ?? 0) >= limit) {
    return NextResponse.json({ error: `Article limit reached (${limit})` }, { status: 403 })
  }

  const { data: article, error } = await db
    .from('articles')
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags,
      project_id: parsed.data.projectId,
      author_id: session.user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(article, { status: 201 })
}
