import { createFileRoute } from '@tanstack/react-router'
import NewPhysicalPackagePage from '@/features/admin/catalog/pages/physical/new'

export const Route = createFileRoute(
  '/_dashboard/dashboard/catalog/physical/new/',
)({
  component: NewPhysicalPackagePage,
})
