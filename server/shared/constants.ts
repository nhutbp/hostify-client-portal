export const CUSTOMER_GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  UNDISCLOSED: 'UNDISCLOSED',
} as const

export type CustomerGender = (typeof CUSTOMER_GENDERS)[keyof typeof CUSTOMER_GENDERS]

export const CUSTOMER_GENDER_VALUES = Object.values(CUSTOMER_GENDERS) as [
  CustomerGender,
  ...CustomerGender[],
]

export const CUSTOMER_STATUSES = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[keyof typeof CUSTOMER_STATUSES]

export const CUSTOMER_STATUS_VALUES = Object.values(CUSTOMER_STATUSES) as [
  CustomerStatus,
  ...CustomerStatus[],
]

export const CUSTOMER_STATUS_FILTERS = {
  ALL: 'ALL',
  ...CUSTOMER_STATUSES,
} as const

export type CustomerStatusFilter =
  (typeof CUSTOMER_STATUS_FILTERS)[keyof typeof CUSTOMER_STATUS_FILTERS]

export const CUSTOMER_STATUS_FILTER_VALUES = Object.values(
  CUSTOMER_STATUS_FILTERS,
) as [CustomerStatusFilter, ...CustomerStatusFilter[]]

export const ADMIN_USER_STATUS_VALUES = [
  'ALL',
  'ACTIVE',
  'BLOCKED',
  'PENDING',
] as const

export const ADMIN_USER_MUTABLE_STATUS_VALUES = [
  'ACTIVE',
  'BLOCKED',
  'PENDING',
] as const

export const SYSTEM_STAFF_ASSIGNMENT_VALUES = [
  'ALL',
  'ASSIGNED',
  'UNASSIGNED',
] as const
