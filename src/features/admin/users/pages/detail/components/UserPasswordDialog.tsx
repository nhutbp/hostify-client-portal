import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
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

export function UserPasswordDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('adminUsers')
  const { resetPassword } = useAdminUserMutations()
  const form = useForm({
    defaultValues: { password: '', confirmation: '' },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmation) return
      try {
        await resetPassword.mutateAsync({
          id: userId,
          password: value.password,
        })
        toast.success(t('detail.passwordSuccess'))
        form.reset()
        onOpenChange(false)
      } catch (error) {
        toast.apiError(error, t('detail.passwordFailed'))
      }
    },
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('detail.resetPassword')}</DialogTitle>
          <DialogDescription>
            {t('detail.resetPasswordDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 6 ? t('detail.passwordMin') : undefined,
            }}
          >
            {(field) => (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">
                  {t('detail.newPassword')}
                </span>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors[0] ? (
                  <span className="text-xs text-red-600">
                    {String(field.state.meta.errors[0])}
                  </span>
                ) : null}
              </label>
            )}
          </form.Field>
          <form.Field
            name="confirmation"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password')
                  ? t('detail.passwordMismatch')
                  : undefined,
            }}
          >
            {(field) => (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">
                  {t('detail.confirmPassword')}
                </span>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors[0] ? (
                  <span className="text-xs text-red-600">
                    {String(field.state.meta.errors[0])}
                  </span>
                ) : null}
              </label>
            )}
          </form.Field>
          <div className="flex justify-end gap-2">
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
              {([canSubmit, pending]) => (
                <Button type="submit" disabled={!canSubmit || pending}>
                  {t('detail.resetPassword')}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
