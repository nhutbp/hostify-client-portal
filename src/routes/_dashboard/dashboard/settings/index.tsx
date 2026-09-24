import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/features/admin/system/pages/settings'
import { requirePermission } from '@/features/auth/guards/requirePermission'

export const Route = createFileRoute('/_dashboard/dashboard/settings/')({
  beforeLoad: () => requirePermission('system.setting.view'),
  head: () => ({ meta: [{ title: 'Cài đặt hệ thống' }] }),
  component: SettingsPage,
})
