import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { AdminManagedRole, AdminPermission } from '../../../types'
import { useAdminUserMutations } from '../../../hooks/useAdminUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from '@/utils/toast'
import { PermissionModule } from './PermissionModule'
import { ROLE_CODES } from '../../../../../../../shared/roles'

export function RoleFormSheet({
  open,
  onOpenChange,
  role,
  roles,
  permissions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: AdminManagedRole
  roles: AdminManagedRole[]
  permissions: AdminPermission[]
}) {
  const { t } = useTranslation('adminUsers')
  const { createRole, updateRole } = useAdminUserMutations()
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      canAccessDashboard: true,
      permissionCodes: [] as string[],
      templateRoleId: '',
    },
    onSubmit: async ({ value }) => {
      try {
        if (role)
          await updateRole.mutateAsync({
            id: role.id,
            ...value,
            description: value.description || undefined,
          })
        else
          await createRole.mutateAsync({
            ...value,
            description: value.description || undefined,
          })
        toast.success(
          t(
            role
              ? 'roleManagement.messages.updated'
              : 'roleManagement.messages.created',
          ),
        )
        onOpenChange(false)
      } catch (error) {
        toast.apiError(error, t('roleManagement.messages.failed'))
      }
    },
  })
  useEffect(() => {
    if (open)
      form.reset({
        name: role?.name ?? '',
        code: role?.code ?? '',
        description: role?.description ?? '',
        canAccessDashboard: role?.canAccessDashboard ?? true,
        permissionCodes: role?.permissionCodes ?? [],
        templateRoleId: '',
      })
  }, [form, open, role])
  const modules = [
    ...new Set(permissions.map((permission) => permission.module)),
  ]
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>
            {t(
              role
                ? 'roleManagement.form.editTitle'
                : 'roleManagement.form.createTitle',
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t('roleManagement.form.description')}
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length < 2 ? t('form.required') : undefined,
                }}
              >
                {(field) => (
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">
                      {t('roleManagement.form.name')}
                    </span>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors[0] && (
                      <small className="text-red-600">
                        {String(field.state.meta.errors[0])}
                      </small>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field
                name="code"
                validators={{
                  onChange: ({ value }) =>
                    /^[A-Z0-9_]{2,80}$/.test(value)
                      ? undefined
                      : t('roleManagement.form.codeHint'),
                }}
              >
                {(field) => (
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">
                      {t('roleManagement.form.code')}
                    </span>
                    <Input
                      value={field.state.value}
                      disabled={role?.isSystem}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9_]/g, '_'),
                        )
                      }
                    />
                    {field.state.meta.errors[0] && (
                      <small className="text-red-600">
                        {String(field.state.meta.errors[0])}
                      </small>
                    )}
                  </label>
                )}
              </form.Field>
            </div>
            <form.Field name="description">
              {(field) => (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">
                    {t('roleManagement.form.roleDescription')}
                  </span>
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                  />
                </label>
              )}
            </form.Field>
            {!role && (
              <form.Field name="templateRoleId">
                {(field) => (
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">
                      {t('roleManagement.form.copyFrom')}
                    </span>
                    <select
                      value={field.state.value}
                      onChange={(event) => {
                        const templateRole = roles.find(
                          (item) => item.id === event.target.value,
                        )
                        field.handleChange(event.target.value)
                        if (templateRole)
                          form.setFieldValue(
                            'permissionCodes',
                            templateRole.permissionCodes,
                          )
                        if (templateRole)
                          form.setFieldValue(
                            'canAccessDashboard',
                            templateRole.canAccessDashboard,
                          )
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm"
                    >
                      <option value="">
                        {t('roleManagement.form.emptyTemplate')}
                      </option>
                      {roles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </form.Field>
            )}
            <form.Field name="canAccessDashboard">
              {(field) => (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary-200 bg-primary-50/60 p-4">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(value) =>
                      field.handleChange(value === true)
                    }
                    disabled={role?.code === ROLE_CODES.SUPER_ADMIN}
                  />
                  <span>
                    <strong className="block text-sm text-slate-900">
                      {t('roleManagement.form.dashboardAccess')}
                    </strong>
                    <small className="mt-1 block text-xs leading-5 text-slate-500">
                      {t('roleManagement.form.dashboardAccessHint')}
                    </small>
                  </span>
                </label>
              )}
            </form.Field>
            <form.Field name="permissionCodes">
              {(field) => (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">
                      {t('roleManagement.permissions')}
                    </h3>
                    <button
                      type="button"
                      className="text-sm text-primary-700"
                      onClick={() =>
                        field.handleChange(
                          field.state.value.length === permissions.length
                            ? []
                            : permissions.map((item) => item.code),
                        )
                      }
                    >
                      {field.state.value.length === permissions.length
                        ? t('roleManagement.clearAll')
                        : t('roleManagement.selectAll')}
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl border">
                    {modules.map((module) => {
                      const modulePermissions = permissions.filter(
                        (permission) => permission.module === module,
                      )
                      return (
                        <PermissionModule
                          key={module}
                          module={module}
                          permissions={modulePermissions}
                          selectedCodes={field.state.value}
                          expanded={expandedModules.includes(module)}
                          disabled={false}
                          onExpand={() =>
                            setExpandedModules((current) =>
                              current.includes(module)
                                ? current.filter((item) => item !== module)
                                : [...current, module],
                            )
                          }
                          onToggle={(code) =>
                            field.handleChange(
                              field.state.value.includes(code)
                                ? field.state.value.filter(
                                    (item) => item !== code,
                                  )
                                : [...field.state.value, code],
                            )
                          }
                          onToggleModule={() => {
                            const codes = modulePermissions.map(
                              ({ code }) => code,
                            )
                            const allSelected = codes.every((code) =>
                              field.state.value.includes(code),
                            )
                            field.handleChange(
                              allSelected
                                ? field.state.value.filter(
                                    (code) => !codes.includes(code),
                                  )
                                : [
                                    ...new Set([
                                      ...field.state.value,
                                      ...codes,
                                    ]),
                                  ],
                            )
                          }}
                          t={t}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex justify-end gap-2 border-t bg-white p-4">
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
                  {t(
                    role
                      ? 'roleManagement.form.save'
                      : 'roleManagement.form.create',
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
