import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import type {
  ForgotPasswordRequest,
  RegisterRequest,
  ResendVerificationEmailRequest,
  ResetPasswordRequest,
} from '../types/auth'

export function useCreateRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (data: ResendVerificationEmailRequest) =>
      authService.resendVerificationEmail(data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
  })
}
