import { useSearch } from '@tanstack/react-router'
import VerifyEmailContent from './components/VerifyEmailContent'

export default function VerifyEmailPage() {
  const search = useSearch({ from: '/(auth)/verify-email' })

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
        <div className="flex w-full justify-center">
          <VerifyEmailContent email={search.email?.trim() ?? ''} />
        </div>
      </section>
    </div>
  )
}
