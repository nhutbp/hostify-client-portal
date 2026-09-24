import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/utils/toast'
import { useAdminUserMutations } from '../../hooks/useAdminUsers'

export function AddUserDialog({
  open,
  onOpenChange,
  defaultRoleCode = 'CUSTOMER',
  lockRole = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRoleCode?:
    | 'CUSTOMER'
    | 'SYSTEM_STAFF'
    | 'SUPPORT'
    | 'FINANCE'
    | 'ADMIN'
  lockRole?: boolean
}) {
  const { t } = useTranslation('adminUsers')
  const { create } = useAdminUserMutations()
  const form = useForm({
    defaultValues: {
      displayName: '',
      login: '',
      email: '',
      phone: '',
      password: '',
      roleCode: defaultRoleCode,
      status: 'ACTIVE' as 'ACTIVE' | 'PENDING' | 'BLOCKED',
    },
    onSubmit: async ({ value }) => {
      try {
        await create.mutateAsync({ ...value, phone: value.phone || undefined })
        toast.success(t('form.success'))
        form.reset()
        onOpenChange(false)
      } catch (error) {
        toast.apiError(error, t('form.failed'))
      }
    },
  })
  const fieldClass =
    'space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200'
  const selectClass =
    'h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('form.title')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {(
            ['displayName', 'login', 'email', 'phone', 'password'] as const
          ).map((name) => (
            <form.Field
              key={name}
              name={name}
              validators={{
                onChange: ({ value }) =>
                  name !== 'phone' && !value.trim()
                    ? t('form.required')
                    : undefined,
              }}
            >
              {(field) => (
                <label
                  className={`${fieldClass} ${name === 'email' ? 'sm:col-span-2' : ''}`}
                >
                  <span>
                    {t(`form.${name === 'displayName' ? 'name' : name}`)}
                  </span>
                  <Input
                    type={
                      name === 'password'
                        ? 'password'
                        : name === 'email'
                          ? 'email'
                          : 'text'
                    }
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required={name !== 'phone'}
                  />
                  {field.state.meta.errors[0] && (
                    <span className="text-xs text-red-600">
                      {String(field.state.meta.errors[0])}
                    </span>
                  )}
                </label>
              )}
            </form.Field>
          ))}
          <form.Field name="roleCode">
            {(field) => (
              <label className={fieldClass}>
                <span>{t('form.role')}</span>
                <select
                  className={selectClass}
                  value={field.state.value}
                  disabled={lockRole}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as typeof field.state.value,
                    )
                  }
                >
                  {lockRole ? (
                    <option value={defaultRoleCode}>Nhân viên hệ thống</option>
                  ) : (
                    <>
                      <option value="CUSTOMER">{t('roles.CUSTOMER')}</option>
                      <option value="SYSTEM_STAFF">Nhân viên hệ thống</option>
                      <option value="SUPPORT">{t('roles.STAFF')}</option>
                      <option value="FINANCE">
                        {t('roles.STAFF')} · Finance
                      </option>
                      <option value="ADMIN">{t('roles.ADMIN')}</option>
                    </>
                  )}
                </select>
              </label>
            )}
          </form.Field>
          <form.Field name="status">
            {(field) => (
              <label className={fieldClass}>
                <span>{t('form.status')}</span>
                <select
                  className={selectClass}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as typeof field.state.value,
                    )
                  }
                >
                  <option value="ACTIVE">{t('statuses.ACTIVE')}</option>
                  <option value="PENDING">{t('statuses.PENDING')}</option>
                  <option value="BLOCKED">{t('statuses.BLOCKED')}</option>
                </select>
              </label>
            )}
          </form.Field>
          <DialogFooter className="sm:col-span-2">
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
                  {isSubmitting ? t('form.saving') : t('form.save')}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
