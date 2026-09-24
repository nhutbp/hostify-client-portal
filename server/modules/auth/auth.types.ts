export interface AuthRoleInfo {
  id: string
  roleName: string
  roleDisplayName: string
}

export interface AuthUser {
  id: string
  userLogin: string
  displayName: string
  userEmail: string
  userStatus: string
  userPhone: string | null
  userCode: string
  createdAt: string
  updatedAt: string
  avatarUrl?: string | null
  userRegistered: string
  isVerified: boolean
  userRole: string
  role: AuthRoleInfo
  roleCodes: string[]
  permissionCodes: string[]
  isSuperAdmin: boolean
  canAccessDashboard: boolean
}

export interface LoginCredentials {
  login: string
  password: string
}

export interface RegisterCredentials {
  userLogin: string
  displayName: string
  userEmail: string
  userPhone: string
  userPass: string
  confirm_password: string
}

export interface ResendVerificationEmailCredentials {
  email: string
}

export interface ForgotPasswordCredentials {
  email: string
}

export interface ResetPasswordCredentials {
  token: string
  password: string
  confirm_password: string
}
