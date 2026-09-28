import { createFileRoute } from '@tanstack/react-router'
import ViaPackageDetailPage from '@/features/admin/catalog/pages/via/detail'
export const Route = createFileRoute('/_dashboard/dashboard/catalog/via/$id/')({
  component: RouteComponent,
})
function RouteComponent() {
  return <ViaPackageDetailPage id={Route.useParams().id} />
}
