import { createFileRoute, redirect } from '@tanstack/react-router'
import { verifyEmailLink } from '../../../server/modules/auth/auth'

type VerifyEmailConfirmSearch = {
  userId?: string
  createdAt?: string
  email?: string
}

export const Route = createFileRoute('/(auth)/verify-email/confirm')({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search.userId === 'string' ? search.userId : undefined,
    createdAt:
      typeof search.createdAt === 'string' ? search.createdAt : undefined,
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  loader: async ({ location }) => {
    const queryParams = new URLSearchParams(location.searchStr)
    const query: VerifyEmailConfirmSearch = {
      userId: queryParams.get('userId') ?? undefined,
      createdAt: queryParams.get('createdAt') ?? undefined,
      email: queryParams.get('email') ?? undefined,
    }

    if (!query.userId || !query.createdAt) {
      throw redirect({
        to: '/verify-email',
        search: {
          userId: undefined,
          createdAt: undefined,
          email: query.email,
        },
      })
    }

    await verifyEmailLink({
      data: {
        userId: query.userId,
        createdAt: query.createdAt,
        email: query.email,
      },
    })

    throw redirect({
      to: '/dashboard',
    })
  },
})
