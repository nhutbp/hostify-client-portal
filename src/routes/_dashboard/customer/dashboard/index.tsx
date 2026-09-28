import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/customer/dashboard/')({
  beforeLoad: () => {
    throw redirect({ to: '/customer/dashboard/buy' })
  },
})
