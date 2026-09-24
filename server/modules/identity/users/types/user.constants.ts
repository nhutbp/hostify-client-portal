export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  UNVERIFY: 'UNVERIFY',
  BLOCKED: 'BLOCKED',
} as const

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES]

export function normalizeUserStatus(
  status: string | null | undefined,
): UserStatus {
  const value = (status || USER_STATUSES.ACTIVE).toUpperCase()
  if (value === USER_STATUSES.BLOCKED) return USER_STATUSES.BLOCKED
  if (value === USER_STATUSES.UNVERIFY) return USER_STATUSES.UNVERIFY
  return USER_STATUSES.ACTIVE
}
