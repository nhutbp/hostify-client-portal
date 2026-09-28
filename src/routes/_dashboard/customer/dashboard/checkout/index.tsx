import { createFileRoute } from '@tanstack/react-router'
import CustomerCheckoutPage from '@/features/customer/commerce/pages/CustomerCheckoutPage'

export const Route = createFileRoute(
  '/_dashboard/customer/dashboard/checkout/',
)({
  head: () => ({ meta: [{ title: 'Thanh toán | Hostify' }] }),
  component: CustomerCheckoutPage,
})
