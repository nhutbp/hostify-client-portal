import { createFileRoute } from '@tanstack/react-router'
import EditVpsPackagePage from '@/features/admin/catalog/pages/vps/edit'

export const Route = createFileRoute(
  '/_dashboard/admin/dashboard/catalog/vps/$id/edit/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditVpsPackagePage id={Route.useParams().id} />
}
