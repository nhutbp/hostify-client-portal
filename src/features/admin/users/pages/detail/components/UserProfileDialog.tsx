import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { AdminUserDetail } from '../../../types'
import { useAdminUserMutations } from '../../../hooks/useAdminUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/utils/toast'

export function UserProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('adminUsers')
  const { updateProfile } = useAdminUserMutations()
  const form = useForm({
    defaultValues: {
      displayName: user.displayName,
      email: user.email,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
      birthDate: user.birthDate ?? '',
      gender: user.gender,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile.mutateAsync({
          id: user.id,
          ...value,
          phone: value.phone || undefined,
          avatarUrl: value.avatarUrl || undefined,
          birthDate: value.birthDate || undefined,
        })
        toast.success(t('editor.profileSuccess'))
        onOpenChange(false)
      } catch (error) {
        toast.apiError(error, t('editor.profileFailed'))
      }
    },
  })
  useEffect(() => {
    if (!open) return
    form.reset({
      displayName: user.displayName,
      email: user.email,
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
      birthDate: user.birthDate ?? '',
      gender: user.gender,
    })
  }, [form, open, user])
  const fields = [
    'displayName',
    'email',
    'phone',
    'avatarUrl',
    'birthDate',
  ] as const
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('editor.profileTitle')}</DialogTitle>
          <DialogDescription>
            {t('editor.profileDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          {fields.map((name) => (
            <form.Field
              key={name}
              name={name}
              validators={{
                onChange: ({ value }) =>
                  (name === 'displayName' || name === 'email') && !value.trim()
                    ? t('form.required')
                    : undefined,
              }}
            >
              {(field) => (
                <label
                  className={
                    name === 'avatarUrl'
                      ? 'space-y-1.5 sm:col-span-2'
                      : 'space-y-1.5'
                  }
                >
                  <span className="text-sm font-medium">
                    {t(`editor.fields.${name}`)}
                  </span>
                  <Input
                    type={
                      name === 'email'
                        ? 'email'
                        : name === 'birthDate'
                          ? 'date'
                          : 'text'
                    }
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {field.state.meta.errors[0] ? (
                    <span className="text-xs text-red-600">
                      {String(field.state.meta.errors[0])}
                    </span>
                  ) : null}
                </label>
              )}
            </form.Field>
          ))}
          <form.Field name="gender">
            {(field) => (
              <label className="space-y-1.5">
                <span className="text-sm font-medium">
                  {t('editor.fields.gender')}
                </span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value as typeof field.state.value,
                    )
                  }
                >
                  {(['UNDISCLOSED', 'MALE', 'FEMALE', 'OTHER'] as const).map(
                    (value) => (
                      <option key={value} value={value}>
                        {t(`editor.genders.${value}`)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            )}
          </form.Field>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('form.cancel')}
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? t('form.saving') : t('editor.saveProfile')}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
