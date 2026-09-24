import type { ReactNode } from 'react'
import type { PermissionActionCode } from '@/types/permission'
import { useCurrentUser } from '@/features/auth/store/authStore'

export function usePermission(permission: PermissionActionCode) {
  const user = useCurrentUser()
  return Boolean(
    user?.isSuperAdmin || user?.permissionCodes.includes(permission),
  )
}

export function usePermissions(permissions: PermissionActionCode[]) {
  const user = useCurrentUser()
  const granted = new Set(user?.permissionCodes ?? [])
  return Object.fromEntries(
    permissions.map((permission) => [
      permission,
      Boolean(user?.isSuperAdmin || granted.has(permission)),
    ]),
  ) as Record<PermissionActionCode, boolean>
}

export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: PermissionActionCode
  children: ReactNode
  fallback?: ReactNode
}) {
  return usePermission(permission) ? children : fallback
}
