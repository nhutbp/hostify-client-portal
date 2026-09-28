import { createFileRoute } from '@tanstack/react-router'
import NewViaPackagePage from '@/features/admin/catalog/pages/via/new'
export const Route = createFileRoute('/_dashboard/admin/dashboard/catalog/via/new')({
  component: NewViaPackagePage,
})
