import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { createServiceClient } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        const githubEmail = (profile as any)?.email ?? null
        if (githubEmail) {
          user.email = githubEmail
        } else {
          const githubLogin = (profile as any)?.login
          if (githubLogin) {
            user.email = `${githubLogin}@users.noreply.github.com`
          } else {
            return false
          }
        }
      }

      try {
        const db = createServiceClient()

        const { data: existing } = await db
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single()

        if (existing) {
          user.id = existing.id
        } else {
          const { data: newUser } = await db
            .from('users')
            .insert({
              email: user.email,
              name: user.name,
              avatar: user.image,
            })
            .select('id')
            .single()
          if (newUser) user.id = newUser.id
        }
      } catch (err) {
        console.error('[TeamMind] signIn upsert error:', err)
      }

      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
}
