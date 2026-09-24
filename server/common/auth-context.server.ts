import { getCurrentUserFromRequest } from '../modules/auth/auth.service.server'
import { createAppError } from './app-error.server'
import { AUTH_ERROR_CODES } from '../modules/auth/auth.errors'
import { isPermissionCode } from '../../shared/permissions'
import type { PermissionActionCode } from '../../shared/permissions'
import { ADMIN_ROLE_CODES, ROLE_CODES } from '../../shared/roles'

export async function requireAuthContext() {
  const response = await getCurrentUserFromRequest()
  const user = response.result

  if (!user) {
    throw createAppError({
      message: 'Bạn cần đăng nhập để thực hiện thao tác này',
      errorCode: AUTH_ERROR_CODES.AUTHENTICATION_REQUIRED,
      statusCode: 401,
    })
  }

  return { user }
}

async function getAuthorizationContext() {
  const { user } = await requireAuthContext()
  const roleCodes = user.roleCodes
  const permissionCodes = new Set(user.permissionCodes)
  const isAdmin = roleCodes.some((roleCode) =>
    ADMIN_ROLE_CODES.includes(roleCode as (typeof ADMIN_ROLE_CODES)[number]),
  )

  return {
    user,
    roleCodes,
    permissionCodes,
    isSuperAdmin: roleCodes.includes(ROLE_CODES.SUPER_ADMIN),
    isAdmin,
  }
}

function throwForbidden(): never {
  throw createAppError({
    message: 'Bạn không có quyền thực hiện thao tác này',
    errorCode: AUTH_ERROR_CODES.AUTHORIZATION_REQUIRED,
    statusCode: 403,
  })
}

export async function requirePermission(permissionCode: PermissionActionCode) {
  if (!isPermissionCode(permissionCode)) {
    throw createAppError({
      message: `Quyền hệ thống không hợp lệ: ${permissionCode}`,
      errorCode: AUTH_ERROR_CODES.INVALID_PERMISSION_CODE,
      statusCode: 500,
    })
  }
  const context = await getAuthorizationContext()
  if (!context.isSuperAdmin && !context.permissionCodes.has(permissionCode))
    throwForbidden()
  return context
}

export async function requireAnyPermission(
  permissionCodes: PermissionActionCode[],
) {
  const context = await getAuthorizationContext()
  if (
    !context.isSuperAdmin &&
    !permissionCodes.some((code) => context.permissionCodes.has(code))
  )
    throwForbidden()
  return context
}
