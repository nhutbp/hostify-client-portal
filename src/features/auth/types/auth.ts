import type { AuthUser } from '../../../../server/modules/identity/auth/auth.types'

export type User = AuthUser

export interface LoginRequest {
  login: string
  password: string
}

export interface RegisterRequest {
  userLogin: string
  displayName: string
  userEmail: string
  userPhone: string
  userPass: string
  confirm_password: string
}

export interface ResendVerificationEmailRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirm_password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
