import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="font-black text-2xl text-blue-300">TeamMind</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            ログイン
          </Link>
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-24 text-center">
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-6">
          AI-Powered Team Knowledge Base
        </p>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          チームの知恵を、<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            消さない。
          </span>
        </h1>
        <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Slackに流れる情報・会議の決定事項をAIが自動キャプチャ。<br />
          自然語で検索して、いつでもチームの知識を引き出せます。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-400 font-bold px-10 py-4 rounded-2xl text-lg transition-colors shadow-xl shadow-blue-500/30"
          >
            Google / GitHub でサインイン
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-4">クレジットカード不要 · Free プランあり</p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          {[
            { icon: '⚡', title: 'Slack自動キャプチャ', desc: 'チャンネルの会話を自動でナレッジ化。大切な情報を取りこぼしません。' },
            { icon: '🔍', title: 'AI自然語検索', desc: '「あの件ってどうだったっけ？」を普通の言葉で検索。GPT-4oが回答します。' },
            { icon: '📁', title: 'プロジェクト管理', desc: 'チーム・案件別にナレッジを整理。メンバー招待でコラボレーション。' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
