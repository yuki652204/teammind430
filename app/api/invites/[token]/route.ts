import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/types'

export async function POST(_: NextRequest, { params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: project } = await db
    .from('projects')
    .select('id, plan')
    .eq('invite_token', params.token)
    .single()

  if (!project) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })

  const { data: existing } = await db
    .from('memberships')
    .select()
    .eq('user_id', session.user.id)
    .eq('project_id', project.id)
    .single()

  if (existing) return NextResponse.json({ error: 'Already a member', projectId: project.id })

  const { count } = await db
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project.id)

  const limit = PLAN_LIMITS[project.plan as 'free' | 'pro'].members
  if (limit !== Infinity && (count ?? 0) >= limit) {
    return NextResponse.json({ error: 'Team member limit reached' }, { status: 403 })
  }

  await db.from('memberships').insert({
    user_id: session.user.id,
    project_id: project.id,
    role: 'member',
  })

  return NextResponse.json({ ok: true, projectId: project.id })
}
