import { createFileRoute } from '@tanstack/react-router'
import AdminHostingPackagesPage from '@/features/admin/catalog/pages/hosting'

export const Route = createFileRoute('/_dashboard/admin/dashboard/catalog/hosting/')({
  component: AdminHostingPackagesPage,
})
