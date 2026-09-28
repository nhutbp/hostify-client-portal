import { createFileRoute } from '@tanstack/react-router'
import HostingPackageDetailPage from '@/features/admin/catalog/pages/hosting/detail'

export const Route = createFileRoute(
  '/_dashboard/dashboard/catalog/hosting/$id/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <HostingPackageDetailPage id={Route.useParams().id} />
}
