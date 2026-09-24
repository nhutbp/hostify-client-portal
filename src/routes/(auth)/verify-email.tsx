import { createFileRoute, redirect } from '@tanstack/react-router'
import VerifyEmailPage from '@/features/auth/pages/verify-email/index.tsx'
import { getCurrentUser } from '../../../server/modules/auth/auth'
import { unwrapSuccessResponse } from '@/utils/response'

export const Route = createFileRoute('/(auth)/verify-email')({
  head: () => ({ meta: [{ title: 'Xác minh email' }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search.userId === 'string' ? search.userId : undefined,
    createdAt:
      typeof search.createdAt === 'string' ? search.createdAt : undefined,
    email: typeof search.email === 'string' ? search.email : undefined,
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
  component: VerifyEmailPage,
})
