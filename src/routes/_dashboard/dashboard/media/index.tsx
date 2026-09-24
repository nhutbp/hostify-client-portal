import { createFileRoute } from '@tanstack/react-router'
import MediaPage from '@/features/admin/media/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/media/')({
  beforeLoad: () => requirePermission('media.library.view'),
  head: () => ({ meta: [{ title: 'Media' }] }),
  component: MediaPage,
})
