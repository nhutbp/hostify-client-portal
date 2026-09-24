import type { User } from '../types/auth'

export function getAuthenticatedRedirect(
  user: User,
  returnUrl?: string | null,
) {
  if (!user.canAccessDashboard) return '/account'

  return returnUrl?.startsWith('/') ? returnUrl : '/dashboard'
}
