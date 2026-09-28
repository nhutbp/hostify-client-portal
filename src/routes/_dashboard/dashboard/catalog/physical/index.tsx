import { createFileRoute } from '@tanstack/react-router'
import AdminPhysicalPackagesPage from '@/features/admin/catalog/pages/physical'

export const Route = createFileRoute('/_dashboard/dashboard/catalog/physical/')(
  {
    component: AdminPhysicalPackagesPage,
  },
)
