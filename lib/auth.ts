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
      // GitHub may return a null email when the user has set it to private.
      // Fall back to the primary email exposed via the profile object, or
      // generate a placeholder so we never reject a valid OAuth login.
      if (!user.email) {
        const githubEmail = (profile as any)?.email ?? null
        if (githubEmail) {
          user.email = githubEmail
        } else {
          // GitHub private-email users: use the noreply address GitHub provides
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
        await db.from('users').upsert(
          {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.image,
          },
          { onConflict: 'email' }
        )
      } catch (err) {
        // Log but don't block login if the DB upsert fails
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
