import { createFileRoute, redirect } from '@tanstack/react-router'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password/index.tsx'
import { getCurrentUser } from '../../../server/modules/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'

export const Route = createFileRoute('/(auth)/forgot-password')({
  head: () => ({ meta: [{ title: 'Quên mật khẩu' }] }),
  loader: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (user) {
      throw redirect({
        to: '/dashboard',
      })
    }
    return null
  },
  component: ForgotPasswordPage,
})
