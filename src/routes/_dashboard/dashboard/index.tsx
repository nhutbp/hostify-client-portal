import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '@/features/admin/dashboard/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/')({
  beforeLoad: async () => {
    await requirePermission('dashboard.overview.view')
  },
  head: () => ({ meta: [{ title: 'Dashboard' }] }),
  component: DashboardPage,
})
