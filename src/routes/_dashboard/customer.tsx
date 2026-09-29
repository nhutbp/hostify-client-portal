import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../../../server/modules/identity/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'
import { ROLE_CODES } from '../../../shared/roles'
import FullLayout from '@/layouts/full/FullLayout'

export const Route = createFileRoute('/_dashboard/customer')({
  beforeLoad: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (!user) throw redirect({ to: '/login' })
    if (!user.roleCodes.includes(ROLE_CODES.CUSTOMER)) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <FullLayout area="customer">
      <Outlet />
    </FullLayout>
  ),
})
