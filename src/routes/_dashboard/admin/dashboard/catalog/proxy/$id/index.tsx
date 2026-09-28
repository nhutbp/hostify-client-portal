import { createFileRoute } from '@tanstack/react-router'
import ProxyPackageDetailPage from '@/features/admin/catalog/pages/proxy/detail'
export const Route = createFileRoute(
  '/_dashboard/admin/dashboard/catalog/proxy/$id/',
)({ component: RouteComponent })
function RouteComponent() {
  return <ProxyPackageDetailPage id={Route.useParams().id} />
}
