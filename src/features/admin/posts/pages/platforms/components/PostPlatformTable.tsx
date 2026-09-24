import { createColumnHelper } from '@tanstack/react-table'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table } from '@/components/table/Table'
import type { PaginationMeta } from '@/components/table/Pagination'
import type { PostPlatform } from './data'

const helper = createColumnHelper<PostPlatform>()

export function PostPlatformTable({
  platforms,
  search,
  onSearchChange,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: {
  platforms: PostPlatform[]
  search: string
  onSearchChange: (value: string) => void
  pagination: PaginationMeta
  isLoading?: boolean
  onEdit: (platform: PostPlatform) => void
  onDelete: (platform: PostPlatform) => void
  canUpdate: boolean
  canDelete: boolean
}) {
  const { t } = useTranslation('posts')
  const columns = [
    helper.display({
      id: 'select',
      header: () => <input type="checkbox" aria-label="Select all" />,
      cell: ({ row }) => (
        <input type="checkbox" aria-label={row.original.name} />
      ),
      size: 44,
    }),
    helper.accessor('name', {
      header: t('platform'),
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-semibold text-primary">{getValue()}</p>
          <p className="text-xs text-slate-400">/{row.original.slug}</p>
        </div>
      ),
    }),
    helper.accessor('description', {
      header: t('description'),
      cell: ({ getValue }) => (
        <span className="line-clamp-2 max-w-xs text-slate-500">
          {getValue() || '—'}
        </span>
      ),
    }),
    helper.display({
      id: 'posts',
      header: t('postCount'),
      cell: ({ row }) => (
        <span className="text-primary">{row.original._count?.posts ?? 0}</span>
      ),
    }),
    helper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {canUpdate && (
            <Button type="button" variant="outline" size="sm" className="size-8 p-0" onClick={() => onEdit(row.original)} aria-label="Sửa">
              <Pencil className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button type="button" variant="outline" size="sm" className="size-8 p-0 text-red-500" onClick={() => onDelete(row.original)} aria-label="Xóa">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
      size: 100,
    }),
  ]
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-end gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search" className="pl-9" />
        </div>
        <div className="shrink-0 text-sm text-slate-500">{pagination.total}</div>
      </div>
      <Table data={platforms} columns={columns} pagination={pagination} isLoading={isLoading} getRowId={(row) => row.id} emptyMessage={t('empty')} />
    </div>
  )
}
