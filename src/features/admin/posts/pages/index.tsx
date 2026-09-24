import type { RowSelectionState } from '@tanstack/react-table'
import { FileText, Pencil, Plus } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table } from '@/components/table/Table'
import type { PaginationMeta } from '@/components/table/Pagination'
import { usePosts } from '../hooks/usePosts'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { createAppColumnHelper } from '@/components/table/tableConfig'

type PostRow = {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED'
  updatedAt: string | Date
  categories: Array<{ category: { name: string } }>
  platforms: Array<{ platform: { name: string } }>
}
const helper = createAppColumnHelper<PostRow>()
export default function PostsPage() {
  const { t } = useTranslation('posts')
  const navigate = useNavigate()
  const query = usePosts()
  const [selection, setSelection] = useState<RowSelectionState>({})
  const posts = (query.data?.items ?? []) as PostRow[]
  const pagination: PaginationMeta = query.data?.meta ?? {
    page: 1,
    limit: 10,
    total: posts.length,
    totalPages: 1,
  }
  const canCreate = usePermission('post.post.create')
  const canUpdate = usePermission('post.post.update')
  const canViewCategories = usePermission('post.post_category.view')
  const columns = [
    helper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(value === true)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          onClick={(event) => event.stopPropagation()}
        />
      ),
      size: 44,
    }),
    helper.display({
      id: 'number',
      header: 'STT',
      cell: ({ row }) =>
        (pagination.page - 1) * pagination.limit + row.index + 1,
      size: 56,
    }),
    helper.accessor('title', {
      header: t('title'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            {canUpdate ? (
              <Link
                to="/dashboard/posts/$postId/edit"
                params={{ postId: row.original.id }}
                className="font-semibold hover:text-primary"
              >
                {row.original.title}
              </Link>
            ) : (
              <span className="font-semibold">{row.original.title}</span>
            )}
            <p className="mt-1 truncate text-xs text-slate-400">
              /{row.original.slug}
            </p>
          </div>
        </div>
      ),
    }),
    helper.display({
      id: 'category',
      header: t('category'),
      cell: ({ row }) =>
        row.original.categories.map((item) => item.category.name).join(', ') ||
        '—',
    }),
    helper.display({
      id: 'platform',
      header: 'Platform',
      cell: ({ row }) =>
        row.original.platforms.map((item) => item.platform.name).join(', ') ||
        '—',
    }),
    helper.accessor('status', {
      header: t('status'),
      cell: ({ getValue }) => (
        <span
          className={
            getValue() === 'PUBLISHED'
              ? 'rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-600'
              : 'rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500'
          }
        >
          {t(`statuses.${getValue().toLowerCase()}`)}
        </span>
      ),
    }),
    helper.accessor('updatedAt', {
      header: t('updatedAt'),
      cell: ({ getValue }) => new Date(getValue()).toLocaleString('vi-VN'),
    }),
    helper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canUpdate && (
            <Button variant="ghost" className="size-9 p-0" asChild>
              <Link
                to="/dashboard/posts/$postId/edit"
                params={{ postId: row.original.id }}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
      size: 90,
    }),
  ]
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {canViewCategories && (
            <Button
              variant="outline"
              onClick={() =>
                void navigate({ to: '/dashboard/posts/categories' })
              }
            >
              {t('categories')}
            </Button>
          )}
          {canCreate && (
            <Button
              onClick={() => void navigate({ to: '/dashboard/posts/new' })}
            >
              <Plus />
              {t('create')}
            </Button>
          )}
        </div>
      </div>
      <Table
        data={posts}
        columns={columns}
        pagination={pagination}
        isLoading={query.isLoading}
        emptyMessage={t('empty')}
        getRowId={(row) => row.id}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
      />
    </div>
  )
}
