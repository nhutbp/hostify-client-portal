import { createFileRoute } from '@tanstack/react-router'
import AdminOrderDetailPage from '@/features/admin/orders/pages/detail'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/admin/dashboard/orders/$id/')(
  {
    beforeLoad: () => requirePermission('commerce.order.view'),
    head: () => ({ meta: [{ title: 'Chi tiết đơn hàng' }] }),
    component: () => <AdminOrderDetailPage id={Route.useParams().id} />,
  },
)
