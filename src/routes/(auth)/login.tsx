import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '@/features/auth/pages/login/index.tsx'
import { getCurrentUser } from '../../../server/modules/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'

export const Route = createFileRoute('/(auth)/login')({
  head: () => ({ meta: [{ title: 'Đăng nhập' }] }),
  loader: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (user) {
      throw redirect({
        to: getAuthenticatedRedirect(user),
      })
    }
    return null
  },
  component: LoginPage,
})
