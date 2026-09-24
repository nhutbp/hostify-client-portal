import { Pencil, Search, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table } from '@/components/table/Table'
import type { PaginationMeta } from '@/components/table/Pagination'
import type { PostCategory } from './data'
import { createAppColumnHelper } from '@/components/table/tableConfig'

const helper = createAppColumnHelper<PostCategory>()

export function PostCategoryTable({
  categories,
  search,
  onSearchChange,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: {
  categories: PostCategory[]
  search: string
  onSearchChange: (value: string) => void
  pagination: PaginationMeta
  isLoading?: boolean
  onEdit: (category: PostCategory) => void
  onDelete: (category: PostCategory) => void
  canUpdate: boolean
  canDelete: boolean
}) {
  const { t } = useTranslation('posts')
  const { orderedCategories, depths } = useMemo(() => {
    const map = new Map(categories.map((category) => [category.id, category]))
    const children = new Map<string, PostCategory[]>()
    const roots: PostCategory[] = []
    categories.forEach((category) => {
      if (category.parentId && map.has(category.parentId))
        children.set(category.parentId, [
          ...(children.get(category.parentId) ?? []),
          category,
        ])
      else roots.push(category)
    })
    const ordered: PostCategory[] = []
    const depthMap = new Map<string, number>()
    const visit = (category: PostCategory, depth: number) => {
      ordered.push(category)
      depthMap.set(category.id, depth)
      ;(children.get(category.id) ?? []).forEach((child) =>
        visit(child, depth + 1),
      )
    }
    roots.forEach((root) => visit(root, 0))
    return { orderedCategories: ordered, depths: depthMap }
  }, [categories])
  const columns = [
    helper.display({
      id: 'select',
      header: () => <input type="checkbox" aria-label="Select all" />,
      cell: ({ row }) => (
        <input type="checkbox" aria-label={row.original.name} />
      ),
      size: 44,
    }),
    helper.display({
      id: 'image',
      header: t('featuredImage'),
      cell: ({ row }) => (
        <div className="flex size-9 items-center justify-center overflow-hidden rounded border border-slate-200 text-xs text-slate-400 dark:border-slate-700">
          {row.original.imageUrl ? (
            <img
              src={row.original.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            '—'
          )}
        </div>
      ),
    }),
    helper.accessor('name', {
      header: t('category'),
      cell: ({ getValue, row }) => (
        <div
          style={{
            paddingLeft: `${(depths.get(row.original.id) ?? 0) * 20}px`,
          }}
        >
          <p className="font-semibold text-primary">{getValue()}</p>
          <p className="text-xs text-slate-400">/{row.original.slug}</p>
        </div>
      ),
    }),
    helper.display({
      id: 'parent',
      header: t('parentCategory'),
      cell: ({ row }) => (
        <span className="text-slate-500">
          {row.original.parent?.name ?? t('rootCategory')}
        </span>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 p-0"
              onClick={() => onEdit(row.original)}
              aria-label="Sửa"
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 p-0 text-red-500"
              onClick={() => onDelete(row.original)}
              aria-label="Xóa"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
      size: 120,
    }),
  ]
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {canDelete && (
          <div className="flex items-center gap-2">
            <Select defaultValue="bulk">
              <SelectTrigger>
                <SelectValue placeholder="Bulk action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk">Bulk action</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Apply
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
          <div className="shrink-0 text-sm text-slate-500">
            {pagination.total}
          </div>
        </div>
      </div>
      <Table
        data={orderedCategories}
        columns={columns}
        pagination={pagination}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        emptyMessage={t('empty')}
      />
      <p className="mt-3 text-xs text-slate-500">
        {t('categoryTableNote', {
          defaultValue:
            'Danh mục có thể phân cấp cha – con và dùng để nhóm các bài viết.',
        })}
      </p>
    </div>
  )
}
