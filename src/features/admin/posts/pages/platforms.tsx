import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeletePostPlatform, usePostPlatforms } from '../hooks/usePosts'
import { usePermission } from '@/features/auth/hooks/usePermission'
import type { PaginationMeta } from '@/components/table/Pagination'
import { PostPlatformForm } from './platforms/components/PostPlatformForm'
import { PostPlatformTable } from './platforms/components/PostPlatformTable'
import type { PostPlatform } from './platforms/components/data'

export default function PostPlatformsPage() {
  const { t } = useTranslation('posts')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editingPlatform, setEditingPlatform] = useState<PostPlatform | null>(
    null,
  )
  const query = usePostPlatforms()
  const deletePlatform = useDeletePostPlatform()
  const canCreate = usePermission('post.post_platform.create')
  const canUpdate = usePermission('post.post_platform.update')
  const canDelete = usePermission('post.post_platform.delete')
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timeout)
  }, [search])
  const platforms = ((query.data ?? []) as PostPlatform[]).filter((platform) =>
    `${platform.name} ${platform.slug}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  )
  const pagination: PaginationMeta = {
    page: 1,
    limit: platforms.length || 10,
    total: platforms.length,
    totalPages: 1,
  }
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('platforms')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('platformsDescription')}
        </p>
      </div>
      <div
        className={`grid items-start gap-5 ${canCreate || (canUpdate && editingPlatform) ? 'xl:grid-cols-[minmax(280px,3fr)_minmax(0,7fr)]' : ''}`}
      >
        {(canCreate || (canUpdate && editingPlatform)) && (
          <PostPlatformForm
            editingPlatform={editingPlatform}
            onDone={() => setEditingPlatform(null)}
            onCancel={() => setEditingPlatform(null)}
          />
        )}
        <PostPlatformTable
          platforms={platforms}
          search={search}
          onSearchChange={setSearch}
          pagination={pagination}
          isLoading={query.isLoading}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={setEditingPlatform}
          onDelete={(platform) => {
            if (!window.confirm(`Xóa platform "${platform.name}"?`)) return
            void deletePlatform.mutateAsync(platform.id)
          }}
        />
      </div>
    </div>
  )
}
