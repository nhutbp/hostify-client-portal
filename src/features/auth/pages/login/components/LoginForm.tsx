import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { InputField } from '@/components/form/InputField'
import { InputFieldPassword } from '@/components/form/InputFieldPassword'
import { useAuth } from '@/features/auth/store/authStore'
import type { LoginRequest } from '@/features/auth/types/auth'
import { cn } from '@/utils/utils'
import { getApiErrorCode } from '@/utils/apiError'
import { toast } from '@/utils/toast'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { getReturnUrl } from '@/utils/returnUrl'
import { getAuthenticatedRedirect } from '@/features/auth/utils/authRedirect'

const loginDefaultValues = {
  login: '',
  password: '',
} satisfies LoginRequest

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const form = useForm({
    defaultValues: loginDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {}
        if (!value['login'].trim())
          errors['login'] = t('auth.validation.emailRequired')
        if (!value['password'].trim())
          errors['password'] = t('auth.validation.passwordRequired')
        return Object.keys(errors).length ? errors : undefined
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError('')
        const user = await login(value)
        const savedReturnUrl = getReturnUrl()
        const redirectTo = getAuthenticatedRedirect(user, savedReturnUrl)
        navigate({ to: redirectTo })
      } catch (error) {
        const errorCode = getApiErrorCode(error)
        if (errorCode === 'AUTH_002') {
          navigate({
            to: '/verify-email',
            search: {
              userId: undefined,
              createdAt: undefined,
              email: value.login.trim(),
            },
          })
          return
        }
        const message = t('auth.loginFailed')
        setSubmitError(message)
        toast.apiError(error, message)
      }
    },
  })

  return (
    <form
      className={cn('flex w-full flex-col gap-4 sm:gap-6', className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          {t('auth.loginDescription')}
        </p>
      </div>

      <FieldGroup className="gap-3 sm:gap-4">
        {submitError ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
          >
            {submitError}
          </div>
        ) : null}

        <form.Field
          name="login"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? t('auth.validation.emailRequired') : undefined,
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.email')}
              required
              id={field.name}
              type="text"
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.enterEmail')}
              autoComplete="username"
              startIcon={<Mail className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? t('auth.validation.passwordRequired') : undefined,
          }}
        >
          {(field) => (
            <InputFieldPassword
              label={t('auth.password')}
              required
              id={field.name}
              type={showPassword ? 'text' : 'password'}
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.enterPassword')}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault()
              }}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
              startIcon={<Lock className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <div className="flex justify-end pt-0.5">
          <Button variant="link" className="h-auto px-0 py-0" asChild>
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </Button>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              disabled={!canSubmit || isSubmitting}
            >
              <ArrowRight className="h-5 w-5" />
              {isSubmitting ? t('auth.loginSigningIn') : t('auth.signIn')}
            </Button>
          )}
        </form.Subscribe>

        <div className="pt-0.5 text-center text-xs text-slate-500 sm:pt-2 sm:text-sm">
          {t('auth.loginPrompt')}{' '}
          <Button variant="link" className="h-auto px-0 py-0" asChild>
            <Link to="/register">{t('auth.signUp')}</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
