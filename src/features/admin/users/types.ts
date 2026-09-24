export type AdminUserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN'
export type AdminUserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING'

export type AdminUser = {
  id: string
  code: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: AdminUserRole
  status: AdminUserStatus
  lastLoginAt: string | Date | null
}

export type AdminUserStats = {
  total: number
  active: number
  blocked: number
  pending: number
  newUsers: number
  roles: Record<AdminUserRole, number>
}

export type AdminUserDetail = {
  id: string
  code: string
  login: string
  displayName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  birthDate?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED'
  status: AdminUserStatus
  roleCodes: string[]
  isSuperAdmin: boolean
  permissions: Array<{ code: string; name: string; description: string | null }>
  createdAt: string | Date
  updatedAt: string | Date
  lastLoginAt: string | Date | null
  addresses: Array<{
    id: string
    label: string
    recipientName: string
    phone: string
    provinceName: string | null
    districtName: string | null
    wardName: string | null
    addressLine: string
    isDefault: boolean
  }>
  sessions: Array<{
    id: string
    createdAt: string | Date
    revokedAt: string | Date | null
    accessTokenExpires: string | Date
    deviceInfo: unknown
  }>
  activities: Array<{
    id: string
    action: string
    entityType: string
    before: unknown
    after: unknown
    ipAddress: string | null
    userAgent: string | null
    createdAt: string | Date
  }>
}

export type AssignableRole = {
  id: string
  code: string
  name: string
  description: string | null
  permissions: Array<{
    code: string
    module: string
    resource: string
    action: 'view' | 'create' | 'update' | 'delete' | 'approve'
    name: string
    description: string | null
  }>
}

export type AdminPermission = {
  id: string
  code: string
  module: string
  resource: string
  action: 'view' | 'create' | 'update' | 'delete' | 'approve'
  name: string
  description: string | null
}

export type AdminManagedRole = {
  id: string
  code: string
  name: string
  description: string | null
  canAccessDashboard: boolean
  isSystem: boolean
  userCount: number
  permissionCount: number
  permissionCodes: string[]
  users: Array<{
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }>
}

export type AdminRoleManagement = {
  stats: {
    roles: number
    users: number
    permissions: number
    customRoles: number
  }
  permissions: AdminPermission[]
  roles: AdminManagedRole[]
}
