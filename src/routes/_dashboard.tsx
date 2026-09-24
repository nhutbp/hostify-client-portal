import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import FullLayout from '../layouts/full/FullLayout'
import { getCurrentUser } from '../../server/modules/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'

export const Route = createFileRoute('/_dashboard')({
  loader: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (!user) {
      throw redirect({
        to: '/login',
      })
    }
    if (!user.canAccessDashboard) {
      throw redirect({ to: '/' })
    }
    return user
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <FullLayout>
      <Outlet />
    </FullLayout>
  )
}
