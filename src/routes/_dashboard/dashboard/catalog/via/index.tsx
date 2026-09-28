import { createFileRoute } from '@tanstack/react-router'
import AdminViaPackagesPage from '@/features/admin/catalog/pages/via'
export const Route = createFileRoute('/_dashboard/dashboard/catalog/via/')({
  component: AdminViaPackagesPage,
})
