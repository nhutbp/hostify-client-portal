import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { InputField } from '@/components/form/InputField'
import { InputFieldPassword } from '@/components/form/InputFieldPassword'
import { useCreateRegister } from '@/features/auth/hooks/useAuth'
import type { RegisterRequest } from '@/features/auth/types/auth'
import { preventSpaceInput } from '@/utils/format'
import { normalizePhoneForVN } from '@/utils/phone'
import { cn } from '@/utils/utils'
import { getApiErrorMessage } from '@/utils/apiError'
import { toast } from '@/utils/toast'
import { Loader2, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react'

const registerDefaultValues = {
  displayName: '',
  userEmail: '',
  userLogin: '',
  userPhone: '',
  userPass: '',
  confirm_password: '',
} satisfies RegisterRequest

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const registerMutation = useCreateRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const form = useForm({
    defaultValues: registerDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {}
        if (!value.displayName.trim()) {
          errors.displayName = t('auth.validation.fullNameRequired')
        }
        if (!value.userEmail.trim()) {
          errors.userEmail = t('auth.validation.emailRequired')
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (
          value.userEmail.trim() &&
          !emailRegex.test(value.userEmail.trim())
        ) {
          errors.userEmail = t('auth.validation.emailInvalid')
        }
        if (!value.userPhone.trim()) {
          errors.userPhone = t('auth.validation.phoneRequired')
        }
        if (!value.userPass.trim()) {
          errors.userPass = t('auth.validation.passwordRequired')
        }
        if (value.userPass.trim().length < 6) {
          errors.userPass = t('auth.validation.passwordMinLength')
        }
        if (!value.confirm_password.trim()) {
          errors.confirm_password = t('auth.validation.confirmPasswordRequired')
        }
        if (value.confirm_password.trim() !== value.userPass.trim()) {
          errors.confirm_password = t('auth.validation.passwordMismatch')
        }
        return Object.keys(errors).length ? errors : undefined
      },
    },
    onSubmitInvalid: () => {
      setSubmitError(t('auth.registerInvalidForm'))
      toast.error(t('auth.registerInvalidForm'))
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError('')
        const user = await registerMutation.mutateAsync({
          userLogin: value.userEmail.trim(),
          displayName: value.displayName.trim(),
          userEmail: value.userEmail.trim(),
          userPhone: normalizePhoneForVN(value.userPhone.trim()),
          userPass: value.userPass,
          confirm_password: value.confirm_password,
        })

        toast.success(t('auth.registerSuccess'))
        navigate({
          to: '/verify-email',
          search: {
            userId: user.id,
            createdAt: user.createdAt,
            email: user.userEmail,
          },
          replace: true,
        })
      } catch (error) {
        const message = getApiErrorMessage(error, t('auth.registerInvalidForm'))
        setSubmitError(message)
        toast.error(message)
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
          {t('auth.registerTitle')}
        </h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          {t('auth.registerDescription')}
        </p>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
        >
          {submitError}
        </div>
      ) : null}

      <FieldGroup className="gap-3 sm:gap-4">
        <form.Field
          name="displayName"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? t('auth.validation.fullNameRequired') : undefined,
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.fullName')}
              required
              id={field.name}
              type="text"
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.fullName')}
              autoComplete="name"
              startIcon={<User className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="userEmail"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return t('auth.validation.emailRequired')
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(value.trim()))
                return t('auth.validation.emailInvalid')
              return undefined
            },
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.email')}
              required
              id={field.name}
              type="email"
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.enterEmail')}
              autoComplete="email"
              startIcon={<Mail className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="userPhone"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? t('auth.validation.phoneRequired') : undefined,
          }}
        >
          {(field) => (
            <InputField
              label={t('auth.phoneNumber')}
              required
              id={field.name}
              type="tel"
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.phoneNumber')}
              autoComplete="tel"
              startIcon={<Phone className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="userPass"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return t('auth.validation.passwordRequired')
              if (value.length < 6)
                return t('auth.validation.passwordMinLength')
              return undefined
            },
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
              autoComplete="new-password"
              onKeyDown={preventSpaceInput}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
              startIcon={<Lock className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field
          name="confirm_password"
          validators={{
            onChange: ({ value, fieldApi }) => {
              const password = fieldApi.form.getFieldValue('userPass')
              const confirmPassword = value.trim()
              if (!confirmPassword)
                return t('auth.validation.confirmPasswordRequired')
              if (confirmPassword !== password)
                return t('auth.validation.passwordMismatch')
              return undefined
            },
          }}
        >
          {(field) => (
            <InputFieldPassword
              label={t('auth.confirmPasswordLabel')}
              required
              id={field.name}
              type={showConfirmPassword ? 'text' : 'password'}
              variant="default"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={Boolean(field.state.meta.errors[0])}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              onKeyDown={preventSpaceInput}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
              startIcon={<Lock className="h-5 w-5" />}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([, isSubmitting]) => {
            const isLoading = isSubmitting || registerMutation.isPending
            return (
              <Button
                type="submit"
                variant="primary"
                className="w-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('auth.registerSigningUp')}
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    {t('auth.signUp')}
                  </>
                )}
              </Button>
            )
          }}
        </form.Subscribe>

        <div className="pt-0.5 text-center text-xs text-slate-500 sm:pt-2 sm:text-sm">
          {t('auth.registerPrompt')}{' '}
          <Button variant="link" className="h-auto px-0 py-0" asChild>
            <Link to="/login">{t('auth.login')}</Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
