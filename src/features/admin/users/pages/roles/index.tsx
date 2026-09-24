import { useEffect, useMemo, useState } from 'react'
import {
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RoleFormSheet } from './components/RoleFormSheet'
import { RoleListItem } from './components/RoleListItem'
import { RoleStatCard } from './components/RoleStatCard'
import { PermissionModule } from './components/PermissionModule'
import { RoleSummarySidebar } from './components/RoleSummarySidebar'
import { rolePanel } from './components/rolesShared'
import {
  useAdminRoleManagement,
  useAdminUserMutations,
} from '../../hooks/useAdminUsers'
import type { AdminManagedRole, AdminPermission } from '../../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/utils/toast'
import { usePermission } from '@/features/auth/hooks/usePermission'

export default function AdminRolesPage() {
  const { t } = useTranslation('adminUsers')
  const query = useAdminRoleManagement()
  const { updateRole, deleteRole } = useAdminUserMutations()
  const canCreate = usePermission('user.role.create')
  const canUpdate = usePermission('user.role.update')
  const canDelete = usePermission('user.role.delete')
  const [selectedId, setSelectedId] = useState<string>()
  const [search, setSearch] = useState('')
  const [permissionSearch, setPermissionSearch] = useState('')
  const [tab, setTab] = useState<'ALL' | 'SYSTEM' | 'CUSTOM'>('ALL')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<AdminManagedRole>()
  const [draftPermissions, setDraftPermissions] = useState<string[]>([])
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const data = query.data

  useEffect(() => {
    if (!selectedId && data?.roles[0]) setSelectedId(data.roles[0].id)
  }, [data?.roles, selectedId])

  const roles = useMemo(
    () =>
      (data?.roles ?? []).filter(
        (role) =>
          (!search.trim() ||
            `${role.name} ${role.code}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (tab === 'ALL' ||
            (tab === 'SYSTEM' ? role.isSystem : !role.isSystem)),
      ),
    [data?.roles, search, tab],
  )
  const selected = data?.roles.find((role) => role.id === selectedId)

  useEffect(() => {
    setDraftPermissions(selected?.permissionCodes ?? [])
  }, [selected])

  const modules = useMemo(() => {
    const filtered = (data?.permissions ?? []).filter((permission) =>
      `${permission.name} ${permission.code}`
        .toLowerCase()
        .includes(permissionSearch.trim().toLowerCase()),
    )
    return [...new Set(filtered.map((permission) => permission.module))]
  }, [data?.permissions, permissionSearch])

  useEffect(() => {
    if (modules[0] && expandedModules.length === 0)
      setExpandedModules([modules[0]])
  }, [expandedModules.length, modules])

  const changed = Boolean(
    selected &&
    [...draftPermissions].sort().join('|') !==
      [...selected.permissionCodes].sort().join('|'),
  )

  const togglePermission = (code: string) => {
    setDraftPermissions((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    )
  }

  const toggleModule = (permissions: AdminPermission[]) => {
    const codes = permissions.map((permission) => permission.code)
    const allSelected = codes.every((code) => draftPermissions.includes(code))
    setDraftPermissions((current) =>
      allSelected
        ? current.filter((code) => !codes.includes(code))
        : [...new Set([...current, ...codes])],
    )
  }

  const savePermissions = async () => {
    if (!selected) return
    try {
      await updateRole.mutateAsync({
        id: selected.id,
        name: selected.name,
        code: selected.code,
        description: selected.description ?? undefined,
        canAccessDashboard: selected.canAccessDashboard,
        permissionCodes: draftPermissions,
      })
      toast.success(t('roleManagement.messages.saved'))
    } catch (error) {
      toast.apiError(error, t('roleManagement.messages.failed'))
    }
  }

  const remove = async (role: AdminManagedRole) => {
    if (!window.confirm(t('roleManagement.deleteConfirm', { name: role.name })))
      return
    try {
      await deleteRole.mutateAsync(role.id)
      setSelectedId(undefined)
      toast.success(t('roleManagement.messages.deleted'))
    } catch (error) {
      toast.apiError(error, t('roleManagement.messages.failed'))
    }
  }

  if (query.isLoading)
    return (
      <div className="grid min-h-96 place-items-center text-slate-500">
        {t('loading')}
      </div>
    )
  if (!data)
    return (
      <div className="grid min-h-96 place-items-center text-slate-500">
        {t('roleManagement.loadFailed')}
      </div>
    )

  const statCards = [
    [UsersRound, data.stats.roles, t('roleManagement.stats.roles')],
    [UserRound, data.stats.users, t('roleManagement.stats.users')],
    [
      ShieldCheck,
      data.stats.permissions,
      t('roleManagement.stats.permissions'),
    ],
    [Tag, data.stats.customRoles, t('roleManagement.stats.custom')],
  ] as const
  return (
    <div className="space-y-3 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs text-primary-700">
            Dashboard / {t('title')} / {t('roleManagement.title')}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('roleManagement.title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {t('roleManagement.subtitle')}
          </p>
        </div>
        {canCreate && (
          <Button
            size="sm"
            className="min-w-36"
            onClick={() => {
              setEditing(undefined)
              setSheetOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            {t('roleManagement.add')}
          </Button>
        )}
      </header>

      <section className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {statCards.map(([Icon, value, label]) => (
          <RoleStatCard key={label} icon={Icon} value={value} label={label} />
        ))}
      </section>

      <div className="grid items-start gap-3 xl:grid-cols-[245px_minmax(0,1fr)_245px]">
        <aside className={`${rolePanel} overflow-hidden`}>
          <div className="border-b border-slate-200 p-3">
            <h2 className="text-xs font-bold uppercase">
              {t('roleManagement.list')}
            </h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('roleManagement.search')}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="mt-3 flex border-b border-slate-200 text-xs">
              {(['ALL', 'SYSTEM', 'CUSTOM'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setTab(value)}
                  className={`flex-1 border-b-2 px-1 pb-2 ${
                    tab === value
                      ? 'border-primary-600 font-semibold text-primary-700'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  {t(`roleManagement.tabs.${value}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 p-2.5">
            {roles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                selected={selected?.id === role.id}
                totalPermissions={data.permissions.length}
                onSelect={() => setSelectedId(role.id)}
                t={t}
              />
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  setEditing(undefined)
                  setSheetOpen(true)
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary-500 text-xs font-medium text-primary-700 hover:bg-primary-50"
              >
                <Plus className="size-4" /> {t('roleManagement.add')}
              </button>
            )}
          </div>
        </aside>

        <main className={`${rolePanel} overflow-hidden`}>
          {selected ? (
            <>
              <div className="border-b border-slate-200 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-primary-50 text-primary-700">
                    <ShieldCheck className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{selected.name}</h2>
                      <span className="rounded border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] text-primary-700">
                        {selected.isSystem
                          ? t('roleManagement.system')
                          : t('roleManagement.custom')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {selected.description || t('editor.noDescription')}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {t('roleManagement.form.code')}: <b>{selected.code}</b>
                      <span className="mx-2">•</span>
                      {selected.userCount} {t('roleManagement.users')}
                    </p>
                  </div>
                  {canUpdate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(selected)
                        setSheetOpen(true)
                      }}
                    >
                      <Edit3 className="mr-1.5 size-3.5" />
                      {t('roleManagement.edit')}
                    </Button>
                  )}
                  {canDelete && !selected.isSystem && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => remove(selected)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-b border-slate-200 px-3 pt-3">
                <div className="flex gap-5 text-xs">
                  <span className="border-b-2 border-primary-600 px-1 pb-2 font-semibold text-primary-700">
                    {t('roleManagement.accessPermissions')}
                  </span>
                  <span className="px-1 pb-2 text-slate-500">
                    {t('roleManagement.assignedUsers')} ({selected.userCount})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
                <div className="relative min-w-40 flex-1">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={permissionSearch}
                    onChange={(event) =>
                      setPermissionSearch(event.target.value)
                    }
                    placeholder={t('roleManagement.searchPermissions')}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                {canUpdate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDraftPermissions(
                        data.permissions.map(({ code }) => code),
                      )
                    }
                  >
                    {t('roleManagement.selectAll')}
                  </Button>
                )}
                {canUpdate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDraftPermissions([])}
                  >
                    {t('roleManagement.clearAll')}
                  </Button>
                )}
              </div>

              <div>
                {modules.map((module) => {
                  const permissions = data.permissions.filter(
                    (permission) =>
                      permission.module === module &&
                      `${permission.name} ${permission.code}`
                        .toLowerCase()
                        .includes(permissionSearch.trim().toLowerCase()),
                  )
                  return (
                    <PermissionModule
                      key={module}
                      module={module}
                      permissions={permissions}
                      selectedCodes={draftPermissions}
                      expanded={expandedModules.includes(module)}
                      disabled={!canUpdate || updateRole.isPending}
                      onExpand={() =>
                        setExpandedModules((current) =>
                          current.includes(module)
                            ? current.filter((item) => item !== module)
                            : [...current, module],
                        )
                      }
                      onToggle={togglePermission}
                      onToggleModule={() => toggleModule(permissions)}
                      t={t}
                    />
                  )
                })}
              </div>

              {canUpdate && (
                <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!changed || updateRole.isPending}
                    onClick={() =>
                      setDraftPermissions(selected.permissionCodes)
                    }
                  >
                    {t('roleManagement.cancelChanges')}
                  </Button>
                  <Button
                    size="sm"
                    disabled={!changed || updateRole.isPending}
                    onClick={() => void savePermissions()}
                  >
                    {t('roleManagement.savePermissions')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="grid min-h-96 place-items-center text-sm text-slate-500">
              {t('roleManagement.empty')}
            </div>
          )}
        </main>

        <RoleSummarySidebar
          selected={selected}
          permissionCount={data.permissions.length}
          draftPermissions={draftPermissions}
        />
      </div>

      {(canCreate || canUpdate) && (
        <RoleFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          role={editing}
          roles={data.roles}
          permissions={data.permissions}
        />
      )}
    </div>
  )
}
