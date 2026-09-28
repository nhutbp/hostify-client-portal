import { createFileRoute } from '@tanstack/react-router'
import CustomerBuyPage from '@/features/customer/catalog/pages/CustomerBuyPage'

export const Route = createFileRoute('/_dashboard/customer/dashboard/buy/')({
  head: () => ({ meta: [{ title: 'Mua dịch vụ | Hostify' }] }),
  component: CustomerBuyPage,
})
