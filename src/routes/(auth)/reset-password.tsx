import { createFileRoute, redirect } from '@tanstack/react-router'
import ResetPasswordPage from '@/features/auth/pages/reset-password/index.tsx'
import { getCurrentUser } from '../../../server/modules/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'

export const Route = createFileRoute('/(auth)/reset-password')({
  head: () => ({ meta: [{ title: 'Đặt lại mật khẩu' }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  loader: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (user) {
      throw redirect({
        to: '/dashboard',
      })
    }
    return null
  },
  component: ResetPasswordPage,
})
