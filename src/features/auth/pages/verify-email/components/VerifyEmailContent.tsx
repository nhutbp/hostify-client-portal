import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/common/Panel'
import { Button } from '@/components/ui/button'
import { useResendVerificationEmail } from '@/features/auth/hooks/useAuth'
import { toast } from '@/utils/toast'
import { RotateCcw } from 'lucide-react'

export default function VerifyEmailContent({ email }: { email?: string }) {
  const { t } = useTranslation()
  const resendMutation = useResendVerificationEmail()
  const [now, setNow] = useState(() => Date.now())
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  const cooldownKey = email
    ? `verify-email-resend-cooldown:${email.trim().toLowerCase()}`
    : null

  useEffect(() => {
    if (!cooldownKey) {
      setCooldownUntil(null)
      return
    }

    const storedValue = window.localStorage.getItem(cooldownKey)
    const parsedValue = storedValue ? Number(storedValue) : NaN
    setCooldownUntil(Number.isFinite(parsedValue) ? parsedValue : null)
  }, [cooldownKey])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!cooldownKey || cooldownUntil === null) return

    window.localStorage.setItem(cooldownKey, String(cooldownUntil))
  }, [cooldownKey, cooldownUntil])

  const cooldownRemainingMs =
    cooldownUntil && cooldownUntil > now ? cooldownUntil - now : 0
  const isCooldownActive = cooldownRemainingMs > 0
  const cooldownSecondsLeft = Math.ceil(cooldownRemainingMs / 1000)
  const cooldownMinutes = Math.floor(cooldownSecondsLeft / 60)
  const cooldownSeconds = cooldownSecondsLeft % 60

  const formatCooldown = () => {
    if (cooldownSecondsLeft <= 0) return ''
    return `${cooldownMinutes}:${String(cooldownSeconds).padStart(2, '0')}`
  }

  const handleResendEmail = async () => {
    if (!email) {
      toast.error(t('auth.verifyEmailMissingEmail'))
      return
    }

    if (isCooldownActive) {
      toast.error(
        t('auth.verifyEmailResendCooldown', { time: formatCooldown() }),
      )
      return
    }

    try {
      await resendMutation.mutateAsync({ email })
      const nextCooldownUntil = Date.now() + 2 * 60 * 1000
      setCooldownUntil(nextCooldownUntil)
      toast.success(t('auth.verifyEmailResentSuccess'))
    } catch (error) {
      toast.apiError(error)
    }
  }

  return (
    <Panel className="flex w-full max-w-[calc(100vw-1.5rem)] flex-col items-center gap-5 px-4 py-5 sm:max-w-120 sm:gap-6 sm:px-8 sm:py-8 lg:max-w-120 lg:px-8 lg:py-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-6l-2 3-4-6-2 3H2" />
          <path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
      </div>
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {t('auth.verifyEmailTitle')}
      </h1>
      <p className="max-w-md text-center text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
        {email
          ? t('auth.verifyEmailDescription')
          : t('auth.verifyEmailMissingInfo')}
      </p>

      {email ? (
        <Panel className="w-full bg-slate-50/80 px-4 py-4 text-center shadow-none">
          <p className="text-sm text-slate-500">
            {t('auth.verifyEmailSentTo')}
          </p>
          <p className="mt-1 break-all text-sm font-semibold text-slate-900 sm:text-base">
            {email}
          </p>
        </Panel>
      ) : null}

      {email ? (
        <div className="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-slate-900">
            {t('auth.verifyEmailCheckMail')}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t('auth.verifyEmailDescription')}
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => void handleResendEmail()}
            disabled={resendMutation.isPending || isCooldownActive}
          >
            <RotateCcw className="mr-2 h-4 w-4 shrink-0" />
            {resendMutation.isPending
              ? t('auth.verifyEmailResending')
              : isCooldownActive
                ? t('auth.verifyEmailResendCountdown', {
                    time: formatCooldown(),
                  })
                : t('auth.verifyEmailResendEmail')}
          </Button>
        </div>
      ) : null}

      <Button variant="link" className="h-auto px-0 py-0" asChild>
        <Link to="/login">{t('auth.verifyEmailBackToLogin')}</Link>
      </Button>
    </Panel>
  )
}
