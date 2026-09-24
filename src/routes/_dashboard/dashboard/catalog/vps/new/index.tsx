import { createFileRoute } from '@tanstack/react-router'
import NewVpsPackagePage from '@/features/admin/catalog/pages/vps/new'

export const Route = createFileRoute('/_dashboard/dashboard/catalog/vps/new/')({
  component: NewVpsPackagePage,
})
