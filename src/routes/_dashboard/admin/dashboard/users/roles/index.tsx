import { createFileRoute } from '@tanstack/react-router'
import AdminRolesPage from '@/features/admin/users/pages/roles'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/admin/dashboard/users/roles/')({
  beforeLoad: () => requirePermission('user.role.view'),
  head: () => ({ meta: [{ title: 'Vai trò và phân quyền' }] }),
  component: AdminRolesPage,
})
