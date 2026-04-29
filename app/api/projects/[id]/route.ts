import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: project } = await db
    .from('projects')
    .select('owner_id')
    .eq('id', params.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Only owner can delete the project' }, { status: 403 })
  }

  await db.from('projects').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
