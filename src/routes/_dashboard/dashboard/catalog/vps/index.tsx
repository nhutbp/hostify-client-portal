import { createFileRoute } from '@tanstack/react-router'
import AdminVpsPackagesPage from '@/features/admin/catalog/pages/vps'

export const Route = createFileRoute('/_dashboard/dashboard/catalog/vps/')({
  component: AdminVpsPackagesPage,
})
