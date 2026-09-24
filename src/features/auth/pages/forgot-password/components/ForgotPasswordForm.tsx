import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { InputField } from '@/components/form/InputField'
import { cn } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { useForgotPassword } from '@/features/auth/hooks/useAuth'

const forgotPasswordDefaultValues = {
  email: '',
} satisfies { email: string }

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { t } = useTranslation()
  const forgotPasswordMutation = useForgotPassword()
  const [isSent, setIsSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const form = useForm({
    defaultValues: forgotPasswordDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {}
        const trimmed = value['email'].trim()
        if (!trimmed) errors['email'] = t('auth.validation.emailRequired')
        else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(trimmed))
            errors['email'] = t('auth.validation.emailInvalid')
        }
        return Object.keys(errors).length ? errors : undefined
      },
    },
    onSubmit: async ({ value }) => {
      const email = value.email.trim()

      try {
        const result = await forgotPasswordMutation.mutateAsync({ email })
        setSubmittedEmail(email)
        setIsSent(true)
        toast.success(result.message)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('auth.forgotPasswordSent')
        toast.error(message)
      }
    },
  })

  if (isSent) {
    return (
      <div className="flex w-full flex-col gap-4 sm:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            {t('auth.forgotPasswordSent')}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          {t('auth.forgotPasswordSentTo', { email: submittedEmail })}
        </div>

        <Button variant="primary" className="w-full font-semibold" asChild>
          <Link to="/login">
            <ArrowLeft className="h-5 w-5" />
            {t('auth.backToLogin')}
          </Link>
        </Button>
      </div>
    )
  }

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
          {t('auth.forgotPasswordTitle')}
        </h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          {t('auth.forgotPasswordDescription')}
        </p>
      </div>

      <FieldGroup className="gap-3 sm:gap-4">
        <form.Field
          name="email"
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

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              className="w-full font-semibold"
              disabled={
                !canSubmit || isSubmitting || forgotPasswordMutation.isPending
              }
            >
              <Send className="h-5 w-5" />
              {isSubmitting || forgotPasswordMutation.isPending
                ? t('auth.forgotPasswordSending')
                : t('auth.sendRequest')}
            </Button>
          )}
        </form.Subscribe>

        <div className="text-center text-sm text-gray-600">
          <Button variant="link" className="h-auto px-0 py-0" asChild>
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
