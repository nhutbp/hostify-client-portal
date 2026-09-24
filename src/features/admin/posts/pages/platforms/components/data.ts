export type PostPlatform = {
  id: string
  name: string
  slug: string
  description?: string | null
  _count?: { posts: number }
}
