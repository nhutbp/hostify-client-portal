import { createFileRoute } from '@tanstack/react-router'
import AdminPhysicalPackagesPage from '@/features/admin/catalog/pages/physical'

export const Route = createFileRoute('/_dashboard/admin/dashboard/catalog/physical/')(
  {
    component: AdminPhysicalPackagesPage,
  },
)
