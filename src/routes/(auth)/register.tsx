import { createFileRoute, redirect } from '@tanstack/react-router'
import RegisterPage from '@/features/auth/pages/register/index.tsx'
import { getCurrentUser } from '../../../server/modules/identity/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'

export const Route = createFileRoute('/(auth)/register')({
  head: () => ({ meta: [{ title: 'Đăng ký' }] }),
  loader: async () => {
    const user = unwrapSuccessResponse(await getCurrentUser())
    if (user) {
      throw redirect({
        to: '/dashboard',
      })
    }
    return null
  },
  component: RegisterPage,
})
