import type { User } from '../types/auth'
import { ROLE_CODES } from '../../../../shared/roles'

export function getAuthenticatedRedirect(
  user: User,
  returnUrl?: string | null,
) {
  const isAdmin =
    user.canAccessDashboard &&
    user.roleCodes.some((role) => role !== ROLE_CODES.CUSTOMER)
  const isCustomer = user.roleCodes.includes(ROLE_CODES.CUSTOMER)
  if (returnUrl?.match(/^\/admin\/dashboard(?:\/|\?|$)/) && isAdmin)
    return returnUrl
  if (returnUrl?.match(/^\/customer\/dashboard(?:\/|\?|$)/) && isCustomer)
    return returnUrl
  return isAdmin
    ? '/admin/dashboard'
    : isCustomer
      ? '/customer/dashboard/buy'
      : '/'
}
