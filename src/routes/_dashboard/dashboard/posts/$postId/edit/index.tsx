import { createFileRoute } from '@tanstack/react-router'
import NewPostPage from '@/features/admin/posts/pages/new'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute(
  '/_dashboard/dashboard/posts/$postId/edit/',
)({
  beforeLoad: () => requirePermission('post.post.update'),
  head: () => ({ meta: [{ title: 'Chỉnh sửa bài viết' }] }),
  component: () => <NewPostPage postId={Route.useParams().postId} />,
})
