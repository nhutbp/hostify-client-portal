import { createFileRoute } from '@tanstack/react-router'
import PhysicalPackageDetailPage from '@/features/admin/catalog/pages/physical/detail'

export const Route = createFileRoute(
  '/_dashboard/admin/dashboard/catalog/physical/$id/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <PhysicalPackageDetailPage id={Route.useParams().id} />
}
