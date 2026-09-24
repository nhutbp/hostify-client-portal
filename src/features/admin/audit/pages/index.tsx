import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Table } from '@/components/table/Table'
import { Link } from '@tanstack/react-router'
import { useAuditLogs } from '../hooks/useAuditLogs'

type AuditRow = {
  id: string
  actorUserId: string | null
  action: string
  entityType: string
  entityId: string | null
  createdAt: string
  actor: { id: string; name: string } | null
  entity: { id: string; name: string; code?: string; slug?: string } | null
}

const columnHelper = createColumnHelper<AuditRow>()

function entityHref(row: AuditRow) {
  const identifier = row.entity?.code ?? row.entity?.slug ?? row.entity?.id
  if (!identifier) return null
  switch (row.entityType) {
    case 'user.user':
      return `/dashboard/users/${identifier}`
    default:
      return null
  }
}

export default function AuditLogsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const input = { page, limit: 20 }
  const query = useAuditLogs(input)
  const columns = useMemo(
    () => [
      columnHelper.accessor('action', { header: 'Action' }),
      columnHelper.accessor('entityType', { header: 'Module / Resource' }),
      columnHelper.accessor('entityId', {
        header: 'Entity',
        cell: (info) => {
          const row = info.row.original
          const href = entityHref(row)
          const label = row.entity?.name ?? info.getValue() ?? '—'
          return href ? (
            <Link
              to={href as never}
              className="font-medium text-primary hover:underline"
            >
              {label}
            </Link>
          ) : (
            label
          )
        },
      }),
      columnHelper.accessor('actorUserId', {
        header: 'Người thao tác',
        cell: (info) => {
          const row = info.row.original
          if (!row.actor) return 'System'
          return (
            <Link
              to="/dashboard/users/$userId"
              params={{ userId: row.actor.id }}
              className="font-medium text-primary hover:underline"
            >
              {row.actor.name}
            </Link>
          )
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Time',
        cell: (info) => new Date(info.getValue()).toLocaleString('vi-VN'),
      }),
    ],
    [],
  )
  const result = query.data as
    | {
        items: AuditRow[]
        meta: { page: number; limit: number; total: number; totalPages: number }
      }
    | undefined
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t('sidebar.auditLogs')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lịch sử thao tác của người dùng trong hệ thống.
        </p>
      </div>
      <Table
        data={result?.items ?? []}
        columns={columns}
        isLoading={query.isLoading}
        pagination={result?.meta}
        onPageChange={setPage}
        emptyMessage="Chưa có hoạt động"
      />
    </div>
  )
}
