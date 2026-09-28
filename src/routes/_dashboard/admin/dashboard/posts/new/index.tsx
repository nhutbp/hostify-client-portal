import { createFileRoute } from '@tanstack/react-router'
import NewPostPage from '@/features/admin/posts/pages/new'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/admin/dashboard/posts/new/')({
  beforeLoad: () => requirePermission('post.post.create'),
  head: () => ({ meta: [{ title: 'Thêm bài viết' }] }),
  component: NewPostPage,
})
