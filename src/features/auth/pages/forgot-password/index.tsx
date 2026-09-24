import { Navigate } from '@tanstack/react-router'
import { Panel } from '@/components/common/Panel'
import { useAuth } from '@/features/auth/store/authStore'
import ForgotPasswordForm from './components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" />
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

      <section className="relative grid min-h-svh grid-cols-1 items-center gap-0 px-3 py-3 sm:px-6 sm:py-4 lg:grid-cols-[1fr_0.92fr] lg:gap-8 lg:px-10">
        <div className="hidden min-h-full lg:block" />

        <div className="flex justify-center lg:justify-start">
          <Panel className="w-full max-w-[calc(100vw-1.5rem)] px-4 py-5 sm:max-w-140 sm:px-8 sm:py-8 lg:max-w-130 lg:px-8 lg:py-8">
            <ForgotPasswordForm />
          </Panel>
        </div>
      </section>
    </div>
  )
}
