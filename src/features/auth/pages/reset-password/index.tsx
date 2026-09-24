import { Navigate, useSearch } from '@tanstack/react-router'
import { Panel } from '@/components/common/Panel'
import { useAuth } from '@/features/auth/store/authStore'
import ResetPasswordForm from './components/ResetPasswordForm'

export default function ResetPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const search = useSearch({ from: '/(auth)/reset-password' })
  const token = search.token ?? ''

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" />
  }

  if (!token) {
    return <Navigate to="/forgot-password" />
  }

  return (
    <div className="relative min-h-svh w-full overflow-x-hidden bg-[#eef4fb]">
      <div className="absolute inset-0">
        <img
          src="/lock-images/login-bg.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-l from-white/10 via-white/5 to-white/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.55),transparent_35%)]" />

      <section className="relative flex min-h-svh items-center justify-center px-3 py-3 sm:px-6 sm:py-4 lg:px-10">
        <Panel className="w-full max-w-[calc(100vw-1.5rem)] px-4 py-4 sm:max-w-104 sm:px-7 sm:py-7 lg:max-w-108 lg:px-8 lg:py-8">
          <ResetPasswordForm />
        </Panel>
      </section>
    </div>
  )
}
