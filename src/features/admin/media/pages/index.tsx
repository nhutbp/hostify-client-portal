import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Panel } from '@/components/common/Panel'
import { mediaRecordsToItems } from '../components/media-utils'
import { MediaManager } from '../components/MediaManager'
import {
  useCreateMedia,
  useCreateMediaFolder,
  useDeleteMedia,
  useMediaList,
  useMediaSettings,
  useUpdateMedia,
} from '../hooks/useMediaSettings'
import { usePermission } from '@/features/auth/hooks/usePermission'

export default function MediaPage() {
  const { t } = useTranslation('media')
  const settingsQuery = useMediaSettings()
  const [uploadedById, setUploadedById] = useState('')
  const mediaQuery = useMediaList({
    ...(uploadedById ? { uploadedById } : {}),
  })
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const canCreate = usePermission('media.library.create')
  const canUpdate = usePermission('media.library.update')
  const canDelete = usePermission('media.library.delete')
  const isS3 = settingsQuery.data?.storageMode === 'S3'
  const managerLabels = {
    allFiles: t('manager.allFiles'),
    unclassified: t('manager.unclassified'),

    banner: t('manager.banner'),
    logo: t('manager.logo'),
    documents: t('manager.documents'),
    other: t('manager.other'),
    trash: t('manager.trash'),
    allFilesBreadcrumb: t('manager.allFilesBreadcrumb'),
    search: t('manager.search'),
    newFolder: t('manager.newFolder'),
    upload: t('manager.upload'),
    allTypes: t('manager.allTypes'),
    allSizes: t('manager.allSizes'),
    uploadedAt: t('manager.uploadedAt'),
    filter: t('manager.filter'),
    list: t('manager.list'),
    grid: t('manager.grid'),
    fileInfo: t('manager.fileInfo'),
    selectFile: t('manager.selectFile'),
    filePath: t('manager.filePath'),
    fileSize: t('manager.fileSize'),
    imageSize: t('manager.imageSize'),
    uploadedBy: t('manager.uploadedBy'),
    actions: t('manager.actions'),
    download: t('manager.download'),
    rename: t('manager.rename'),
    move: t('manager.move'),
    copyLink: t('manager.copyLink'),
    edit: t('manager.edit'),
    delete: t('manager.delete'),
    noFiles: t('manager.noFiles'),
    usedStorage: t('manager.usedStorage'),
    manageStorage: t('manager.manageStorage'),
    fileType: t('manager.fileType'),
    folder: t('manager.folder'),
    file: t('manager.file'),
    loadMore: t('manager.loadMore'),
    selectMultiple: t('manager.selectMultiple'),
    cancelSelect: t('manager.cancelSelect'),
    deleteSelected: t('manager.deleteSelected'),
    selectedCount: t('manager.selectedCount'),
  } as const
  const mediaRecords = useMemo(
    () => mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [mediaQuery.data?.pages],
  )
  const mediaFolders = useMemo(
    () => mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
    [mediaQuery.data?.pages],
  )
  const managerItems = useMemo(
    () => mediaRecordsToItems(mediaRecords, mediaFolders),
    [mediaFolders, mediaRecords],
  )
  const storageUsage = mediaQuery.data?.pages[0]?.storage
  const uploaders = mediaQuery.data?.pages[0]?.uploaders ?? []

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('description')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-sm text-slate-500">
          {t('manager.uploadedBy')}:
        </span>
        <select
          value={uploadedById}
          onChange={(event) => setUploadedById(event.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">{t('manager.allUploaders')}</option>
          {uploaders.map((uploader) => (
            <option key={uploader.id} value={uploader.id}>
              {uploader.displayName}
            </option>
          ))}
        </select>
      </div>
      <Panel className="overflow-hidden p-0">
        <MediaManager
          labels={managerLabels}
          storageLabel={isS3 ? t('storage.s3') : t('storage.source')}
          items={managerItems}
          hasMore={mediaQuery.hasNextPage}
          isLoadingMore={mediaQuery.isFetchingNextPage}
          onLoadMore={() => mediaQuery.fetchNextPage()}
          storageUsage={storageUsage}
          onCreateMedia={
            canCreate
              ? (item) =>
                  createMedia.mutateAsync({
                    name: item.name,
                    originalName: item.name,
                    path: item.path,
                    url: item.url ?? `/images/${item.name}`,
                    storageMode: settingsQuery.data?.storageMode ?? 'SOURCE',
                    mimeType: item.mimeType ?? 'application/octet-stream',
                    extension: item.name.split('.').pop() ?? '',
                    size: item.size ?? 0,
                    folder: item.path.split('/').slice(0, -1).join('/') || '/',
                    data: item.data,
                  })
              : undefined
          }
          onCreateFolder={
            canCreate
              ? (folder) =>
                  createFolder
                    .mutateAsync({
                      name: folder.name,
                      parentPath: folder.parentPath,
                      storageMode: settingsQuery.data?.storageMode ?? 'SOURCE',
                    })
                    .then(() => undefined)
              : undefined
          }
          onRenameMedia={
            canUpdate
              ? (item, name) => updateMedia.mutateAsync({ id: item.id, name })
              : undefined
          }
          onDeleteMedia={
            canDelete
              ? (item) =>
                  deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
              : undefined
          }
        />
      </Panel>
    </div>
  )
}
