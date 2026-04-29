import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/types'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('memberships')
    .select('project_id, role, projects(*)')
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const projects = data.map((m) => ({ ...(m.projects as any), role: m.role }))
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createServiceClient()

  // Free plan: max 1 project
  const { count } = await db
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  if ((count ?? 0) >= PLAN_LIMITS.free.projects) {
    return NextResponse.json(
      { error: 'Free plan allows only 1 project. Upgrade to Pro.' },
      { status: 403 }
    )
  }

  const { data: project, error } = await db
    .from('projects')
    .insert({ name: parsed.data.name, description: parsed.data.description, owner_id: session.user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await db.from('memberships').insert({
    user_id: session.user.id,
    project_id: project.id,
    role: 'admin',
  })

  return NextResponse.json(project, { status: 201 })
}
