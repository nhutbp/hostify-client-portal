import { createFileRoute } from '@tanstack/react-router'
import CustomerCartPage from '@/features/customer/commerce/pages/CustomerCartPage'

export const Route = createFileRoute('/_dashboard/customer/dashboard/cart/')({
  head: () => ({ meta: [{ title: 'Giỏ hàng | Hostify' }] }),
  component: CustomerCartPage,
})
