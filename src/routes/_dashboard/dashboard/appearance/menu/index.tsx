import { createFileRoute } from '@tanstack/react-router'
import MenuSettingsPage from '@/features/admin/appearance/pages/menu'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/appearance/menu/')({
  beforeLoad: () => requirePermission('appearance.menu.view'),
  head: () => ({ meta: [{ title: 'Thiết lập menu' }] }),
  component: MenuSettingsPage,
})
