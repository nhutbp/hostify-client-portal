import { createFileRoute } from '@tanstack/react-router'
import CustomerOrderPage from '@/features/customer/commerce/pages/CustomerOrderPage'

export const Route = createFileRoute(
  '/_dashboard/customer/dashboard/orders/$id',
)({
  head: () => ({ meta: [{ title: 'Đơn hàng | Hostify' }] }),
  component: CustomerOrderPage,
})
