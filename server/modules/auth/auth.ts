import { createServerFn } from '@tanstack/react-start'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema,
  verifyEmailLinkSchema,
} from './auth.schemas'
import type { AuthUser } from './auth.types'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getCurrentUserFromRequest } = await import('./auth.service.server')
    return getCurrentUserFromRequest()
  },
)

export const login = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const { loginWithCredentials } = await import('./auth.service.server')
    return loginWithCredentials(data)
  })

export const register = createServerFn({ method: 'POST' })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    const { registerWithCredentials } = await import('./auth.service.server')
    return registerWithCredentials(data)
  })

export const resendVerificationEmail = createServerFn({ method: 'POST' })
  .validator(resendVerificationEmailSchema)
  .handler(async ({ data }) => {
    const { resendVerificationEmail: resendVerificationEmailHandler } =
      await import('./auth.service.server')
    return resendVerificationEmailHandler(data)
  })

export const forgotPassword = createServerFn({ method: 'POST' })
  .validator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const { forgotPasswordWithCredentials } =
      await import('./auth.service.server')
    return forgotPasswordWithCredentials(data)
  })

export const resetPassword = createServerFn({ method: 'POST' })
  .validator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { resetPasswordWithCredentials } =
      await import('./auth.service.server')
    return resetPasswordWithCredentials(data)
  })

export const verifyEmailLink = createServerFn({ method: 'POST' })
  .validator(verifyEmailLinkSchema)
  .handler(async ({ data }) => {
    const { verifyEmailLink: verifyEmailLinkHandler } =
      await import('./auth.service.server')
    return verifyEmailLinkHandler(data)
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const { logoutCurrentSession } = await import('./auth.service.server')
  await logoutCurrentSession()
  return { ok: true }
})

export type { AuthUser }
