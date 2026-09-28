import { createFileRoute } from '@tanstack/react-router'
import EditPhysicalPackagePage from '@/features/admin/catalog/pages/physical/edit'

export const Route = createFileRoute(
  '/_dashboard/dashboard/catalog/physical/$id/edit/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditPhysicalPackagePage id={Route.useParams().id} />
}
