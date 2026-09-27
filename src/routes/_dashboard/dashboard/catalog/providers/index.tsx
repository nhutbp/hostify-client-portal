import { createFileRoute } from '@tanstack/react-router'
import CatalogProvidersPage from '@/features/admin/catalog/pages/providers'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/catalog/providers/')({
  beforeLoad: () => requirePermission('catalog.product.view'),
  head: () => ({ meta: [{ title: 'Nhà cung cấp' }] }),
  component: CatalogProvidersPage,
})
