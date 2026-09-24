import { X } from 'lucide-react'
import { MediaManager } from './MediaManager'
import type { MediaItem, MediaLabels, MediaRecordLike } from './types'

export function MediaPicker({
  open,
  items,
  imageOnly = false,
  videoOnly = false,
  labels,
  title,
  closeLabel,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onCreateMedia,
  onCreateFolder,
  onRenameMedia,
  onDeleteMedia,
  onClose,
  onSelect,
}: {
  open: boolean
  items: MediaItem[]
  imageOnly?: boolean
  videoOnly?: boolean
  labels: MediaLabels
  title: string
  closeLabel: string
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  onCreateMedia?: (
    item: MediaItem,
  ) => Promise<MediaRecordLike | void> | MediaRecordLike | void
  onCreateFolder?: (folder: {
    name: string
    parentPath: string
  }) => Promise<void> | void
  onRenameMedia?: (
    item: MediaItem,
    name: string,
  ) => Promise<MediaRecordLike | void> | MediaRecordLike | void
  onDeleteMedia?: (item: MediaItem) => Promise<void> | void
  onClose: () => void
  onSelect: (item: MediaRecordLike) => void
}) {
  if (!open) return null

  const filterImageItems = (nodes: MediaItem[]): MediaItem[] =>
    nodes
      .filter(
        (item) => item.type === 'folder' || item.mimeType?.startsWith('image/'),
      )
      .map((item) =>
        item.type === 'folder'
          ? { ...item, children: filterImageItems(item.children ?? []) }
          : item,
      )
  const filterVideoItems = (nodes: MediaItem[]): MediaItem[] =>
    nodes
      .filter(
        (item) => item.type === 'folder' || item.mimeType?.startsWith('video/'),
      )
      .map((item) =>
        item.type === 'folder'
          ? { ...item, children: filterVideoItems(item.children ?? []) }
          : item,
      )
  const pickerItems = imageOnly
    ? filterImageItems(items)
    : videoOnly
      ? filterVideoItems(items)
      : items

  const handleSelect = (item: MediaItem) => {
    if (imageOnly && !item.mimeType?.startsWith('image/')) return
    if (videoOnly && !item.mimeType?.startsWith('video/')) return
    onSelect({
      id: item.id,
      name: item.name,
      path: item.path,
      url: item.url ?? '',
      mimeType: item.mimeType ?? 'application/octet-stream',
      size: item.size ?? 0,
      folder: item.path.slice(0, item.path.lastIndexOf('/')) || '/',
      createdAt: item.date.toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="flex max-h-[min(900px,calc(100vh-2rem))] w-full max-w-[1400px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <MediaManager
            labels={labels}
            storageLabel=""
            items={pickerItems}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            onCreateMedia={onCreateMedia}
            onCreateFolder={onCreateFolder}
            onRenameMedia={onRenameMedia}
            onDeleteMedia={onDeleteMedia}
            selectionMode
            onSelectMedia={handleSelect}
          />
        </div>
      </div>
    </div>
  )
}
