import type { AuthUser } from '../../../../server/modules/auth/auth.types'
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendVerificationEmail,
  resetPassword,
} from '../../../../server/modules/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationEmailRequest,
  ResetPasswordRequest,
} from '../types/auth'

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthUser> => {
    return unwrapSuccessResponse(await login({ data: credentials }))
  },

  getMe: async (): Promise<AuthUser | null> => {
    return unwrapSuccessResponse(await getCurrentUser())
  },

  logoutSession: async () => {
    return unwrapSuccessResponse(await logout())
  },

  register: async (credentials: RegisterRequest): Promise<AuthUser> => {
    return unwrapSuccessResponse(await register({ data: credentials }))
  },

  resendVerificationEmail: async (
    credentials: ResendVerificationEmailRequest,
  ) => {
    return unwrapSuccessResponse(
      await resendVerificationEmail({ data: credentials }),
    )
  },

  forgotPassword: async (credentials: ForgotPasswordRequest) => {
    return unwrapSuccessResponse(await forgotPassword({ data: credentials }))
  },

  resetPassword: async (credentials: ResetPasswordRequest) => {
    return unwrapSuccessResponse(await resetPassword({ data: credentials }))
  },
}
