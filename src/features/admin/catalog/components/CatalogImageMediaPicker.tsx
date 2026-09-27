import { useMemo } from 'react'
import { MediaPicker } from '@/features/admin/media/components/MediaPicker'
import { mediaRecordsToItems } from '@/features/admin/media/components/media-utils'
import {
  useCreateMedia,
  useCreateMediaFolder,
  useDeleteMedia,
  useMediaList,
  useMediaSettings,
  useUpdateMedia,
} from '@/features/admin/media/hooks/useMediaSettings'
import { editorMediaLabels } from '@/components/editor/TiptapEditor'

export function CatalogImageMediaPicker({
  open,
  title,
  closeLabel,
  onClose,
  onSelect,
}: {
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  onSelect: (url: string) => void
}) {
  const mediaQuery = useMediaList()
  const settings = useMediaSettings()
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )

  return (
    <MediaPicker
      open={open}
      imageOnly
      items={mediaItems}
      labels={editorMediaLabels}
      title={title}
      closeLabel={closeLabel}
      hasMore={mediaQuery.hasNextPage}
      isLoadingMore={mediaQuery.isFetchingNextPage}
      onLoadMore={() => void mediaQuery.fetchNextPage()}
      onCreateMedia={(item) =>
        createMedia.mutateAsync({
          name: item.name,
          originalName: item.name,
          path: item.path,
          url: item.url ?? `/images/${item.name}`,
          storageMode: settings.data?.storageMode ?? 'SOURCE',
          mimeType: item.mimeType ?? 'application/octet-stream',
          extension: item.name.split('.').pop() ?? '',
          size: item.size ?? 0,
          folder: item.path.split('/').slice(0, -1).join('/') || '/',
          data: item.data,
        })
      }
      onCreateFolder={(folder) =>
        createFolder
          .mutateAsync({
            name: folder.name,
            parentPath: folder.parentPath,
            storageMode: settings.data?.storageMode ?? 'SOURCE',
          })
          .then(() => undefined)
      }
      onRenameMedia={(item, name) =>
        updateMedia.mutateAsync({ id: item.id, name })
      }
      onDeleteMedia={(item) =>
        deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
      }
      onClose={onClose}
      onSelect={(item) => {
        onSelect(item.url || item.path)
        onClose()
      }}
    />
  )
}
