import { createFileRoute } from '@tanstack/react-router'
import CustomerOrdersPage from '@/features/customer/commerce/pages/CustomerOrdersPage'

export const Route = createFileRoute('/_dashboard/customer/dashboard/orders/')({
  head: () => ({ meta: [{ title: 'Lịch sử mua hàng | Hostify' }] }),
  component: CustomerOrdersPage,
})
