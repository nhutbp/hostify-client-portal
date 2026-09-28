import { createFileRoute } from '@tanstack/react-router'
import EditHostingPackagePage from '@/features/admin/catalog/pages/hosting/edit'

export const Route = createFileRoute(
  '/_dashboard/dashboard/catalog/hosting/$id/edit/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditHostingPackagePage id={Route.useParams().id} />
}
