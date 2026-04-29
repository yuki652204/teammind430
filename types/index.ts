export type Plan = 'free' | 'pro'
export type Role = 'admin' | 'member'

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  ownerId: string
  plan: Plan
  inviteToken: string
  createdAt: string
  updatedAt: string
  _count?: {
    members: number
    articles: number
  }
}

export interface Membership {
  userId: string
  projectId: string
  role: Role
  user?: User
}

export interface Article {
  id: string
  title: string
  body: string
  tags: string[]
  projectId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author?: User
}

export interface SearchResult {
  article: Article
  similarity: number
  excerpt: string
}

export interface AISearchResponse {
  query: string
  answer: string
  results: SearchResult[]
  remainingSearches: number
}

export const PLAN_LIMITS = {
  free: {
    projects: 1,
    members: 5,
    articles: 50,
    aiSearchPerMonth: 50,
  },
  pro: {
    projects: Infinity,
    members: Infinity,
    articles: Infinity,
    aiSearchPerMonth: Infinity,
  },
} as const
