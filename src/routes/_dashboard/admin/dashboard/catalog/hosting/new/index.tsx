import { createFileRoute } from '@tanstack/react-router'
import NewHostingPackagePage from '@/features/admin/catalog/pages/hosting/new'

export const Route = createFileRoute(
  '/_dashboard/admin/dashboard/catalog/hosting/new/',
)({
  component: NewHostingPackagePage,
})
