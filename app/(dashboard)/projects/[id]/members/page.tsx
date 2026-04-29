import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import InviteCopyButton from '@/components/ui/InviteCopyButton'
import Image from 'next/image'

export default async function MembersPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const db = createServiceClient()

  const { data: myMembership } = await db
    .from('memberships')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('project_id', params.id)
    .single()

  if (!myMembership) notFound()

  const { data: project } = await db
    .from('projects')
    .select('name, plan, invite_token')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const { data: memberships } = await db
    .from('memberships')
    .select('role, joined_at, users(id, name, email, avatar)')
    .eq('project_id', params.id)
    .order('joined_at')

  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${project.invite_token}`

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">メンバー管理</h1>

      {/* Invite Link */}
      {myMembership.role === 'admin' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
          <p className="font-semibold text-blue-800 text-sm mb-2">招待リンク</p>
          <p className="text-xs text-gray-500 mb-3">
            このリンクを共有してチームメンバーを招待できます。
          </p>
          <InviteCopyButton url={inviteUrl} />
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {(memberships ?? []).map((m) => {
          const user = m.users as any
          return (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={36} height={36} className="rounded-full" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {user.name?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                m.role === 'admin'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {m.role === 'admin' ? '管理者' : 'メンバー'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
