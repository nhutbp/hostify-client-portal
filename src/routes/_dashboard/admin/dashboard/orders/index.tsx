import { createFileRoute } from '@tanstack/react-router'
import AdminOrdersPage from '@/features/admin/orders/pages'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/admin/dashboard/orders/')({
  beforeLoad: () => requirePermission('commerce.order.view'),
  head: () => ({ meta: [{ title: 'Quản lý đơn hàng' }] }),
  component: AdminOrdersPage,
})
