import { createFileRoute } from '@tanstack/react-router'
import CustomerServicesPage from '@/features/customer/services/pages/CustomerServicesPage'

export const Route = createFileRoute(
  '/_dashboard/customer/dashboard/services/',
)({
  head: () => ({ meta: [{ title: 'Quản lý dịch vụ | Hostify' }] }),
  component: CustomerServicesPage,
})
