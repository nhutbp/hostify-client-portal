import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../../../server/modules/identity/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'
import FullLayout from '@/layouts/full/FullLayout'
import { ROLE_CODES } from '../../../shared/roles'

const adminRoles = new Set<string>([
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.ADMIN,
  ROLE_CODES.SYSTEM_STAFF,
  ROLE_CODES.SUPPORT,
  ROLE_CODES.FINANCE,
])

export const Route = createFileRoute('/_dashboard/admin')({
  beforeLoad: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (!user) throw redirect({ to: '/login' })
    if (
      !user.canAccessDashboard ||
      !user.roleCodes.some((role) => adminRoles.has(role))
    ) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <FullLayout>
      <Outlet />
    </FullLayout>
  ),
})
