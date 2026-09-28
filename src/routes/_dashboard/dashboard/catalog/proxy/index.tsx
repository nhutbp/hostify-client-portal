import { createFileRoute } from '@tanstack/react-router'
import AdminProxyPackagesPage from '@/features/admin/catalog/pages/proxy'
export const Route = createFileRoute('/_dashboard/dashboard/catalog/proxy/')({
  component: AdminProxyPackagesPage,
})
