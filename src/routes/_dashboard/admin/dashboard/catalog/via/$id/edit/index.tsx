import { createFileRoute } from '@tanstack/react-router'
import EditViaPackagePage from '@/features/admin/catalog/pages/via/edit'
export const Route = createFileRoute(
  '/_dashboard/admin/dashboard/catalog/via/$id/edit/',
)({ component: RouteComponent })
function RouteComponent() {
  return <EditViaPackagePage id={Route.useParams().id} />
}
