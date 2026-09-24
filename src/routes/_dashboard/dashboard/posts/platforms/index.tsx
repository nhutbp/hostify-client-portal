import { createFileRoute } from '@tanstack/react-router'
import PostPlatformsPage from '@/features/admin/posts/pages/platforms'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/posts/platforms/')({
  beforeLoad: () => requirePermission('post.post_platform.view'),
  head: () => ({ meta: [{ title: 'Platform bài viết' }] }),
  component: PostPlatformsPage,
})
