import { createFileRoute } from '@tanstack/react-router'
import EditProxyPackagePage from '@/features/admin/catalog/pages/proxy/edit'
export const Route = createFileRoute(
  '/_dashboard/dashboard/catalog/proxy/$id/edit/',
)({ component: RouteComponent })
function RouteComponent() {
  return <EditProxyPackagePage id={Route.useParams().id} />
}
