import { createFileRoute } from '@tanstack/react-router'
import CustomerServiceDetailPage from '@/features/customer/services/pages/CustomerServiceDetailPage'

export const Route = createFileRoute(
  '/_dashboard/customer/dashboard/services/$id',
)({
  head: () => ({ meta: [{ title: 'Chi tiết dịch vụ | Hostify' }] }),
  component: CustomerServiceDetailPage,
})
