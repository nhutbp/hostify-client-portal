import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { InputFieldPassword } from '@/components/form/InputFieldPassword'
import { toast } from '@/utils/toast'
import { KeyRound } from 'lucide-react'
import { useResetPassword } from '@/features/auth/hooks/useAuth'

const MIN_PASSWORD_LENGTH = 6

export default function ResetPasswordForm() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/(auth)/reset-password' })
  const token = typeof search.token === 'string' ? search.token : ''
  const resetPasswordMutation = useResetPassword()

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      if (value.newPassword.length < MIN_PASSWORD_LENGTH)
        return toast.error(
          t('auth.resetPasswordPageMinLength', { min: MIN_PASSWORD_LENGTH }),
        )
      if (value.newPassword !== value.confirmPassword)
        return toast.error(t('auth.resetPasswordPageMismatch'))
      if (!token) return toast.error(t('auth.resetPasswordPageInvalidToken'))
      try {
        const result = await resetPasswordMutation.mutateAsync({
          token,
          password: value.newPassword,
          confirm_password: value.confirmPassword,
        })
        setIsSuccess(true)
        toast.success(result.message)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('auth.resetPasswordPageInvalidToken'),
        )
      }
    },
  })

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-5 px-2 py-2 sm:px-4 sm:py-4">
        <div className="rounded-full bg-primary-50 p-3">
          <KeyRound className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-center text-lg font-bold text-gray-900">
          {t('auth.resetPasswordPageSuccessTitle')}
        </h1>
        <p className="text-center text-sm text-gray-600">
          {t('auth.resetPasswordPageSuccessDescription')}
        </p>
        <Button variant="primary" className="w-full font-semibold" asChild>
          <Link to="/login">{t('auth.resetPasswordPageLogin')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-2 py-2 sm:px-4 sm:py-4">
      <div className="flex w-full flex-col items-center gap-4 sm:gap-5">
        <div className="mb-2 flex items-center justify-center">
          <div className="rounded-full bg-primary-50 p-3">
            <KeyRound className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-center text-lg font-bold text-gray-900">
          {t('auth.resetPasswordPageTitle')}
        </h1>
        <p className="text-center text-sm text-gray-600">
          {t('auth.resetPasswordPageDescription', {
            min: MIN_PASSWORD_LENGTH,
          })}
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
        className="mt-5 w-full space-y-4 sm:space-y-5"
      >
        <form.Field
          name="newPassword"
          validators={{
            onChange: ({ value }) =>
              value.length >= MIN_PASSWORD_LENGTH
                ? undefined
                : t('auth.resetPasswordPageMinLength', {
                    min: MIN_PASSWORD_LENGTH,
                  }),
          }}
        >
          {(field) => (
            <InputFieldPassword
              label={t('auth.resetPasswordPageNewPassword')}
              required
              type={showNewPassword ? 'text' : 'password'}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('auth.resetPasswordPageNewPasswordPlaceholder')}
              autoFocus
              showPassword={showNewPassword}
              setShowPassword={setShowNewPassword}
              variant="default"
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
            />
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <InputFieldPassword
              label={t('auth.resetPasswordPageConfirmPassword')}
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t(
                'auth.resetPasswordPageConfirmPasswordPlaceholder',
              )}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              variant="default"
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              disabled={
                !canSubmit || isSubmitting || resetPasswordMutation.isPending
              }
            >
              {resetPasswordMutation.isPending
                ? t('auth.resetPasswordPageSubmitting')
                : t('auth.resetPasswordPageSubmit')}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
