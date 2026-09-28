import { createFileRoute } from '@tanstack/react-router'
import NewProxyPackagePage from '@/features/admin/catalog/pages/proxy/new'
export const Route = createFileRoute('/_dashboard/admin/dashboard/catalog/proxy/new')(
  { component: NewProxyPackagePage },
)
