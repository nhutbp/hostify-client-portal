import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeletePostCategory, usePostCategories } from '../hooks/usePosts'
import { PostCategoryForm } from './categories/components/PostCategoryForm'
import { PostCategoryTable } from './categories/components/PostCategoryTable'
import type { PostCategory } from './categories/components/data'
import type { PaginationMeta } from '@/components/table/Pagination'
import { usePermission } from '@/features/auth/hooks/usePermission'

export default function PostCategoriesPage() {
  const { t } = useTranslation('posts')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editingCategory, setEditingCategory] = useState<PostCategory | null>(
    null,
  )
  const deleteCategory = useDeletePostCategory()
  const canCreate = usePermission('post.post_category.create')
  const canUpdate = usePermission('post.post_category.update')
  const canDelete = usePermission('post.post_category.delete')
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timeout)
  }, [search])
  const query = usePostCategories({
    search: debouncedSearch,
  })
  const categories = (query.data ?? []) as PostCategory[]
  const pagination: PaginationMeta = {
    page: 1,
    limit: categories.length || 10,
    total: categories.length,
    totalPages: 1,
  }
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('categories')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>
      <div
        className={`grid items-start gap-5 ${canCreate || (canUpdate && editingCategory) ? 'xl:grid-cols-[minmax(280px,3fr)_minmax(0,7fr)]' : ''}`}
      >
        {(canCreate || (canUpdate && editingCategory)) && (
          <PostCategoryForm
            categories={categories}
            editingCategory={editingCategory}
            onDone={() => setEditingCategory(null)}
            onCancel={() => setEditingCategory(null)}
          />
        )}
        <PostCategoryTable
          categories={categories}
          search={search}
          onSearchChange={setSearch}
          pagination={pagination}
          isLoading={query.isLoading}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={setEditingCategory}
          onDelete={(category) => {
            if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return
            void deleteCategory.mutateAsync(category.id)
          }}
        />
      </div>
    </div>
  )
}
