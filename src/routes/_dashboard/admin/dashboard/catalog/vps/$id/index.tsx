import { createFileRoute } from '@tanstack/react-router'
import VpsPackageDetailPage from '@/features/admin/catalog/pages/vps/detail'

export const Route = createFileRoute('/_dashboard/admin/dashboard/catalog/vps/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VpsPackageDetailPage id={Route.useParams().id} />
}
