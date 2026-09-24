import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { LockKeyhole, Pencil, UnlockKeyhole } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminUser, AdminUserRole, AdminUserStatus } from '../../types'
import { createIndexColumn } from '@/components/table/IndexColumn'
import { Table } from '@/components/table/Table'
import { TableActionButton } from '@/components/table/TableActions'

const roleStyles: Record<AdminUserRole, string> = {
  CUSTOMER: 'bg-slate-100 text-slate-700',
  STAFF: 'bg-violet-50 text-violet-700',
  ADMIN: 'bg-emerald-50 text-emerald-700',
}
const statusStyles: Record<AdminUserStatus, string> = {
  ACTIVE: 'bg-emerald-500',
  BLOCKED: 'bg-red-500',
  PENDING: 'bg-amber-500',
}

function relativeDate(
  value: string | Date | null,
  locale: string,
  never: string,
) {
  if (!value) return never
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60_000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (minutes < 60) return formatter.format(-Math.max(1, minutes), 'minute')
  if (minutes < 1440) return formatter.format(-Math.floor(minutes / 60), 'hour')
  return formatter.format(-Math.floor(minutes / 1440), 'day')
}

export function UserTable({
  items,
  page,
  limit,
  canUpdate,
  canApprove,
  selected,
  onSelectedChange,
  onStatusChange,
  onEdit,
  pendingId,
}: {
  items: AdminUser[]
  page: number
  limit: number
  canUpdate: boolean
  canApprove: boolean
  selected: Set<string>
  onSelectedChange: (ids: Set<string>) => void
  onStatusChange: (user: AdminUser) => void
  onEdit: (user: AdminUser) => void
  pendingId?: string
}) {
  const { t, i18n } = useTranslation('adminUsers')
  const allSelected =
    items.length > 0 && items.every(({ id }) => selected.has(id))
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      ...(canApprove
        ? [
            {
              id: 'selection',
              size: 48,
              header: () => (
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    onSelectedChange(
                      allSelected
                        ? new Set()
                        : new Set(items.map(({ id }) => id)),
                    )
                  }
                  className="h-4 w-4 accent-emerald-700"
                  aria-label={t('selected', { count: items.length })}
                />
              ),
              cell: ({ row }: { row: { original: AdminUser } }) => (
                <input
                  type="checkbox"
                  checked={selected.has(row.original.id)}
                  onChange={() => {
                    const next = new Set(selected)
                    next.has(row.original.id)
                      ? next.delete(row.original.id)
                      : next.add(row.original.id)
                    onSelectedChange(next)
                  }}
                  className="h-4 w-4 accent-emerald-700"
                  aria-label={row.original.name}
                />
              ),
              meta: { showMobile: true },
            } satisfies ColumnDef<AdminUser>,
          ]
        : []),
      createIndexColumn<AdminUser>({ page, pageSize: limit }),
      {
        id: 'user',
        header: t('columns.user'),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-100 font-bold text-emerald-700 sm:size-10">
              {row.original.avatarUrl ? (
                <img
                  src={row.original.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                row.original.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onEdit(row.original)}
                className="block max-w-36 truncate font-semibold text-slate-900 hover:text-emerald-700 dark:text-white"
              >
                {row.original.name}
              </button>
              <p className="truncate text-xs text-slate-400">
                ID: {row.original.code}
              </p>
            </div>
          </div>
        ),
        meta: { showMobile: true },
      },
      {
        id: 'contact',
        header: t('columns.contact'),
        cell: ({ row }) => (
          <div className="text-slate-600 dark:text-slate-300">
            <p>{row.original.email}</p>
            <p className="text-xs text-slate-400">
              {row.original.phone || '—'}
            </p>
          </div>
        ),
      },
      {
        id: 'role',
        header: t('columns.role'),
        cell: ({ row }) => (
          <span
            className={`rounded-md px-2 py-1 text-xs font-medium ${roleStyles[row.original.role]}`}
          >
            {t(`roles.${row.original.role}`)}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <i
              className={`size-2 rounded-full ${statusStyles[row.original.status]}`}
            />
            <span className="hidden sm:inline">
              {t(`statuses.${row.original.status}`)}
            </span>
          </span>
        ),
        meta: { showMobile: true },
      },
      {
        id: 'lastLogin',
        header: t('columns.lastLogin'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-slate-500">
            {relativeDate(row.original.lastLoginAt, i18n.language, t('never'))}
          </span>
        ),
      },
      ...((canUpdate || canApprove
        ? [
            {
              id: 'actions',
              header: t('columns.actions'),
              cell: ({ row }: { row: { original: AdminUser } }) => (
                <div className="flex items-center justify-end gap-0.5">
                  {canUpdate && (
                    <TableActionButton
                      label={t('actions.edit')}
                      onClick={() => onEdit(row.original)}
                    >
                      <Pencil className="size-4 text-slate-600" />
                    </TableActionButton>
                  )}
                  {canApprove && (
                    <TableActionButton
                      label={
                        row.original.status === 'BLOCKED'
                          ? t('actions.unlock')
                          : t('actions.lock')
                      }
                      tone={
                        row.original.status === 'BLOCKED' ? 'success' : 'danger'
                      }
                      disabled={pendingId === row.original.id}
                      onClick={() => onStatusChange(row.original)}
                    >
                      {row.original.status === 'BLOCKED' ? (
                        <UnlockKeyhole className="size-4 text-emerald-700" />
                      ) : (
                        <LockKeyhole className="size-4 text-red-600" />
                      )}
                    </TableActionButton>
                  )}
                </div>
              ),
              meta: {
                showMobile: true,
                headerClassName: 'text-right',
                cellClassName: 'text-right',
              },
            } satisfies ColumnDef<AdminUser>,
          ]
        : []) as ColumnDef<AdminUser>[]),
    ],
    [
      allSelected,
      canApprove,
      canUpdate,
      i18n.language,
      items,
      limit,
      onEdit,
      onSelectedChange,
      onStatusChange,
      page,
      pendingId,
      selected,
      t,
    ],
  )

  return (
    <Table
      data={items}
      columns={columns}
      getRowId={(user) => user.id}
      className="rounded-none border-x-0 border-b-0"
    />
  )
}
