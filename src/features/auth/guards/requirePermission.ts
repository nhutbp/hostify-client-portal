import { redirect } from '@tanstack/react-router'
import type { PermissionActionCode } from '@/types/permission'
import { getCurrentUser } from '../../../../server/modules/identity/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'

export async function requirePermission(permission: PermissionActionCode) {
  const user = unwrapSuccessResponse(await getCurrentUser())

  if (!user) throw redirect({ to: '/login' })
  if (user.isSuperAdmin || user.permissionCodes.includes(permission)) return

  throw redirect({ to: '/dashboard/forbidden' })
}

export async function requireUserDetailAccess(userId: string) {
  const user = unwrapSuccessResponse(await getCurrentUser())

  if (!user) throw redirect({ to: '/login' })
  if (
    user.id === userId ||
    user.isSuperAdmin ||
    user.permissionCodes.includes('user.user.view')
  )
    return

  throw redirect({ to: '/dashboard/forbidden' })
}
