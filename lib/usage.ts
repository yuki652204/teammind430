import { createServiceClient } from './supabase'
import { PLAN_LIMITS, Plan } from '@/types'

export async function getMonthlySearchCount(
  userId: string,
  projectId: string
): Promise<number> {
  const db = createServiceClient()
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const { count } = await db
    .from('search_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .gte('created_at', start.toISOString())

  return count ?? 0
}

export async function canSearch(
  userId: string,
  projectId: string,
  plan: Plan
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = PLAN_LIMITS[plan].aiSearchPerMonth
  if (limit === Infinity) return { allowed: true, remaining: Infinity }

  const used = await getMonthlySearchCount(userId, projectId)
  const remaining = Math.max(0, limit - used)
  return { allowed: remaining > 0, remaining }
}

export async function logSearch(
  query: string,
  userId: string,
  projectId: string
): Promise<void> {
  const db = createServiceClient()
  await db.from('search_logs').insert({ query, user_id: userId, project_id: projectId })
}
