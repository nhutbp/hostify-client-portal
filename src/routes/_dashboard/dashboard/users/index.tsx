import { createFileRoute } from '@tanstack/react-router'
import AdminUsersPage from '@/features/admin/users/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/users/')({
  beforeLoad: () => requirePermission('user.user.view'),
  head: () => ({ meta: [{ title: 'Quản lý người dùng' }] }),
  component: AdminUsersPage,
})
