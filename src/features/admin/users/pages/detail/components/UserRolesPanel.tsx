import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useTranslation } from 'react-i18next'
import { detailPanel } from './detailShared'
import {
  useAdminAssignableRoles,
  useAdminUserMutations,
} from '../../../hooks/useAdminUsers'
import type { AdminUserDetail, AssignableRole } from '../../../types'
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from '../../../../../../../shared/permissions'
import { ROLE_CODES } from '../../../../../../../shared/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/utils/toast'
import { usePermission } from '@/features/auth/hooks/usePermission'

function PermissionMatrix({
  permissions,
}: {
  permissions: AssignableRole['permissions']
}) {
  const { t } = useTranslation('adminUsers')
  const [expanded, setExpanded] = useState<string[]>([])
  const modules = useMemo(
    () => [...new Set(permissions.map(({ module }) => module))],
    [permissions],
  )

  useEffect(() => {
    if (!expanded.length && modules[0]) setExpanded([modules[0]])
  }, [expanded.length, modules])

  if (!permissions.length)
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        {t('editor.noInheritedPermissions')}
      </p>
    )

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {modules.map((module) => {
        const definition = PERMISSION_MODULES.find(
          (item) => item.code === module,
        )
        const modulePermissions = permissions.filter(
          (permission) => permission.module === module,
        )
        const resources = [
          ...new Set(modulePermissions.map(({ resource }) => resource)),
        ]
        const open = expanded.includes(module)
        return (
          <section key={module} className="border-b last:border-0">
            <button
              type="button"
              onClick={() =>
                setExpanded((current) =>
                  open
                    ? current.filter((item) => item !== module)
                    : [...current, module],
                )
              }
              className="flex h-11 w-full items-center gap-2 px-4 text-left hover:bg-slate-50"
            >
              {open ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <strong className="flex-1 text-sm">
                {definition?.name ?? module}
              </strong>
              <span className="text-xs text-slate-500">
                {t('editor.modulePermissionCount', {
                  count: modulePermissions.length,
                })}
              </span>
            </button>
            {open && (
              <div className="overflow-x-auto border-t bg-slate-50/60 p-3">
                <div className="min-w-[620px] overflow-hidden rounded-lg border bg-white">
                  <div className="grid grid-cols-[minmax(190px,1fr)_repeat(5,76px)] border-b bg-slate-50 text-[10px] font-semibold uppercase text-slate-500">
                    <span className="px-3 py-2">
                      {t('editor.permissionFeature')}
                    </span>
                    {PERMISSION_ACTIONS.map((action) => (
                      <span key={action} className="px-1 py-2 text-center">
                        {t(`editor.permissionActions.${action}`)}
                      </span>
                    ))}
                  </div>
                  {resources.map((resource) => {
                    const resourceDefinition = definition?.resources.find(
                      (item) => item.code === resource,
                    )
                    return (
                      <div
                        key={resource}
                        className="grid min-h-11 grid-cols-[minmax(190px,1fr)_repeat(5,76px)] items-center border-b last:border-0"
                      >
                        <span className="px-3 text-xs font-medium">
                          {resourceDefinition?.name ?? resource}
                        </span>
                        {PERMISSION_ACTIONS.map((action) => {
                          const granted = modulePermissions.some(
                            (permission) =>
                              permission.resource === resource &&
                              permission.action === action,
                          )
                          return (
                            <span key={action} className="flex justify-center">
                              {granted ? (
                                <ShieldCheck className="size-4 text-emerald-600" />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

export function UserRolesPanel({ user }: { user: AdminUserDetail }) {
  const { t } = useTranslation('adminUsers')
  const roles = useAdminAssignableRoles()
  const { updateRoles } = useAdminUserMutations()
  const canAssignRoles = usePermission('user.user.approve')
  const [search, setSearch] = useState('')
  const selectedRoles = user.roleCodes.filter(
    (code) => code !== ROLE_CODES.SUPER_ADMIN,
  )
  const form = useForm({
    defaultValues: { roleCodes: selectedRoles },
    onSubmit: async ({ value }) => {
      try {
        await updateRoles.mutateAsync({
          id: user.id,
          roleCodes: value.roleCodes,
        })
        toast.success(t('editor.rolesSuccess'))
      } catch (error) {
        toast.apiError(error, t('editor.rolesFailed'))
      }
    },
  })
  const roleCodes = useSelector(form.store, (state) => state.values.roleCodes)

  useEffect(
    () => form.reset({ roleCodes: selectedRoles }),
    [form, user.roleCodes],
  )

  const filteredRoles = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return (roles.data ?? []).filter(
      (role) =>
        !keyword ||
        `${role.name} ${role.code} ${role.description ?? ''}`
          .toLowerCase()
          .includes(keyword),
    )
  }, [roles.data, search])

  const permissions = useMemo(() => {
    const selected = new Set(roleCodes)
    return (roles.data ?? [])
      .filter((role) => selected.has(role.code))
      .flatMap((role) => role.permissions)
      .filter(
        (permission, index, values) =>
          values.findIndex((item) => item.code === permission.code) === index,
      )
  }, [roleCodes, roles.data])

  const dirty =
    [...roleCodes].sort().join('|') !== [...selectedRoles].sort().join('|')

  return (
    <form
      className={`${detailPanel} overflow-hidden`}
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-bold">{t('editor.rolesTitle')}</h2>
          <p className="text-sm text-slate-500">
            {t('editor.rolesDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <UsersRound className="size-4" />{' '}
          {t('editor.roleCount', {
            roles: roleCodes.length,
            permissions: permissions.length,
          })}
        </div>
      </header>

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b p-4 lg:border-b-0 lg:border-r">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('editor.searchRoles')}
              className="pl-9"
            />
          </div>
          <form.Field
            name="roleCodes"
            validators={{
              onChange: ({ value }) =>
                value.length ? undefined : t('editor.roleRequired'),
            }}
          >
            {(field) => (
              <div className="space-y-2">
                {filteredRoles.map((role) => {
                  const checked = field.state.value.includes(role.code)
                  return (
                    <label
                      key={role.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${checked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={user.isSuperAdmin || !canAssignRoles}
                        onChange={() =>
                          field.handleChange(
                            checked
                              ? field.state.value.filter(
                                  (code) => code !== role.code,
                                )
                              : [...field.state.value, role.code],
                          )
                        }
                        className="mt-1 size-4 accent-emerald-700"
                      />
                      <span className="min-w-0">
                        <strong className="block truncate text-sm">
                          {role.name}
                        </strong>
                        <small className="block truncate text-[10px] font-medium text-emerald-700">
                          {role.code}
                        </small>
                        <small className="mt-1 block text-xs text-slate-500">
                          {t('editor.permissionCount', {
                            count: role.permissions.length,
                          })}
                        </small>
                      </span>
                    </label>
                  )
                })}
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-red-600">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </aside>

        <section className="min-w-0 p-4">
          <h3 className="mb-3 font-semibold">
            {t('editor.inheritedPermissions')}
          </h3>
          <PermissionMatrix permissions={permissions} />
        </section>
      </div>

      {canAssignRoles && (
        <footer className="flex justify-end gap-2 border-t bg-slate-50 p-4">
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || updateRoles.isPending}
            onClick={() => form.reset({ roleCodes: selectedRoles })}
          >
            {t('editor.cancelRoleChanges')}
          </Button>
          <Button
            type="submit"
            disabled={!dirty || user.isSuperAdmin || updateRoles.isPending}
          >
            {t('editor.saveRoles')}
          </Button>
        </footer>
      )}
    </form>
  )
}
