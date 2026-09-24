export type PostCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  parentId?: string | null
  parent?: { id: string; name: string } | null
  _count?: { posts: number }
}
