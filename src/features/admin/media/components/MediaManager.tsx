import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Grid2X2,
  Image as ImageIcon,
  List,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react'
import { cn } from '@/utils/utils'
import { MediaPreview } from './MediaPreview'
import { MediaTree } from './MediaTree'
import {
  extension,
  formatDate,
  formatSize,
  formatStorageSize,
  getIcon,
} from './media-utils'
import type { MediaItem, MediaLabels, MediaRecordLike } from './types'

export type MediaManagerProps = {
  labels: MediaLabels
  storageLabel: string
  items?: MediaItem[]
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
  storageUsage?: { usedBytes: number; totalBytes: number | null }
  selectionMode?: boolean
  onSelectMedia?: (item: MediaItem) => void
}

export function MediaManager({
  labels,
  storageLabel,
  items: sourceItems = [],
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onCreateMedia,
  onCreateFolder,
  onRenameMedia,
  onDeleteMedia,
  storageUsage,
  selectionMode = false,
  onSelectMedia,
}: MediaManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState(sourceItems)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [multiSelect, setMultiSelect] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [expanded, setExpanded] = useState(new Set<string>())

  useEffect(() => setItems(sourceItems), [sourceItems])

  const findItem = (id: string | null, nodes = items): MediaItem | null => {
    if (!id) return null
    for (const item of nodes) {
      if (item.id === id) return item
      if (item.children) {
        const found = findItem(id, item.children)
        if (found) return found
      }
    }
    return null
  }

  const currentFolder = findItem(currentFolderId)
  const selected = findItem(selectedId)
  const folderTree = useMemo(() => {
    const onlyFolders = (nodes: MediaItem[]): MediaItem[] =>
      nodes
        .filter((item) => item.type === 'folder')
        .map((item) => ({
          ...item,
          children: onlyFolders(item.children ?? []),
        }))
    return onlyFolders(items)
  }, [items])
  const allFiles = useMemo(() => {
    const result: MediaItem[] = []
    const walk = (nodes: MediaItem[]) =>
      nodes.forEach((item) => {
        result.push(item)
        if (item.children) walk(item.children)
      })
    walk(items)
    return result
  }, [items])
  const selectedFiles = useMemo(
    () =>
      allFiles.filter(
        (item) => item.type === 'file' && selectedIds.has(item.id),
      ),
    [allFiles, selectedIds],
  )

  const visibleItems = useMemo(() => {
    const source = currentFolder?.children ?? items
    const keyword = search.trim().toLowerCase()
    return source.filter((item) => {
      const matchSearch = !keyword || item.name.toLowerCase().includes(keyword)
      const matchType = typeFilter === 'all' || item.type === typeFilter
      const matchSize =
        sizeFilter === 'all' ||
        (sizeFilter === 'large'
          ? (item.size ?? 0) > 1024 * 1024
          : (item.size ?? 0) <= 1024 * 1024)
      return matchSearch && matchType && matchSize
    })
  }, [currentFolder, items, search, sizeFilter, typeFilter])

  const selectItem = (item: MediaItem) => {
    if (selectionMode && item.type === 'file') {
      onSelectMedia?.(item)
      return
    }
    if (multiSelect && item.type === 'file') {
      setSelectedIds((current) => {
        const next = new Set(current)
        if (next.has(item.id)) next.delete(item.id)
        else next.add(item.id)
        return next
      })
      setSelectedId(item.id)
      return
    }
    setSelectedId(item.id)
    if (item.type === 'folder') {
      setCurrentFolderId(item.id)
      setExpanded((current) => new Set(current).add(item.id))
    }
  }

  const downloadFile = (item: MediaItem) => {
    if (item.type !== 'file' || !item.url) return
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.name
    link.target = '_blank'
    link.rel = 'noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const downloadSelected = () => {
    selectedFiles.forEach((item, index) => {
      window.setTimeout(() => downloadFile(item), index * 150)
    })
  }

  const uploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = await Promise.all(
      Array.from(event.target.files ?? []).map(async (file) => ({
        id: `upload-${file.name}-${file.lastModified}`,
        name: file.name,
        type: 'file' as const,
        path: `${currentFolder?.path ?? ''}/${file.name}`,
        date: new Date(),
        size: file.size,
        url: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        mimeType: file.type,
        data: await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () =>
            resolve(String(reader.result).split(',')[1] ?? '')
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        }),
      })),
    )
    if (files.length) {
      void Promise.all(
        files.map(async (file) => {
          const created = await onCreateMedia?.(file)
          if (!created) return
          const savedItem: MediaItem = {
            id: created.id,
            name: created.name,
            type: 'file',
            path: created.path,
            date: new Date(created.createdAt),
            size: created.size,
            url: created.url,
            mimeType: created.mimeType,
          }
          setItems((current) => {
            if (!currentFolderId) return [...current, savedItem]
            const append = (nodes: MediaItem[]): MediaItem[] =>
              nodes.map((node) => {
                if (node.id === currentFolderId) {
                  return {
                    ...node,
                    children: [...(node.children ?? []), savedItem],
                  }
                }
                return node.children
                  ? { ...node, children: append(node.children) }
                  : node
              })
            return append(current)
          })
          setSelectedId(created.id)
        }),
      )
    }
    event.target.value = ''
  }

  const createFolder = () => {
    const name = window.prompt(labels.newFolder)
    if (!name?.trim()) return
    void onCreateFolder?.({
      name: name.trim(),
      parentPath: currentFolder?.path ?? '/',
    })
  }

  const renameSelected = async () => {
    if (!selected || selected.type !== 'file') return
    const name = window.prompt(labels.rename, selected.name)?.trim()
    if (!name || name === selected.name) return
    const updated = await onRenameMedia?.(selected, name)
    setItems((current) => {
      const replace = (nodes: MediaItem[]): MediaItem[] =>
        nodes.map((node) => {
          if (node.id !== selected.id)
            return node.children
              ? { ...node, children: replace(node.children) }
              : node
          return {
            ...node,
            name,
            ...(updated
              ? {
                  id: updated.id,
                  path: updated.path,
                  url: updated.url,
                  date: new Date(updated.createdAt),
                }
              : {}),
          }
        })
      return replace(current)
    })
  }

  const deleteSelected = async () => {
    const targets = multiSelect
      ? selectedFiles
      : selected && selected.type === 'file'
        ? [selected]
        : []
    if (!targets.length) return
    if (
      !window.confirm(
        `${labels.deleteSelected}: ${targets.length} ${labels.file}?`,
      )
    )
      return
    await Promise.all(targets.map((item) => onDeleteMedia?.(item)))
    const remove = (nodes: MediaItem[]): MediaItem[] =>
      nodes
        .filter((node) => !targets.some((target) => target.id === node.id))
        .map((node) =>
          node.children ? { ...node, children: remove(node.children) } : node,
        )
    setItems(remove)
    setSelectedId(null)
    setSelectedIds(new Set())
  }

  const breadcrumb = currentFolder?.path.split('/').filter(Boolean) ?? []
  const used = formatStorageSize(storageUsage?.usedBytes ?? 0)
  const total = storageUsage?.totalBytes
    ? formatStorageSize(storageUsage.totalBytes)
    : null
  const usagePercent = storageUsage?.totalBytes
    ? Math.min((storageUsage.usedBytes / storageUsage.totalBytes) * 100, 100)
    : null

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              File Manager
            </h2>
            <span className="text-xs text-slate-500">
              {labels.usedStorage}: {used}
              {total ? ` / ${total}` : ''}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-96 max-w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            {usagePercent !== null && (
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${usagePercent}%` }}
              />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onCreateFolder && (
            <button
              type="button"
              onClick={createFolder}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <Plus size={15} />
              {labels.newFolder}
            </button>
          )}
          {onCreateMedia && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-white hover:bg-primary-hover"
              >
                <Upload size={15} />
                {labels.upload}
                <ChevronDown size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={uploadFiles}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid min-h-[680px] grid-cols-[220px_minmax(0,1fr)_250px] gap-3 p-3 max-[1100px]:grid-cols-[200px_minmax(0,1fr)] max-[1100px]:[&>aside:last-child]:hidden max-[767px]:grid-cols-1 max-[767px]:[&>aside:first-child]:hidden">
        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
            <span>{labels.allFiles}</span>
            <Plus size={15} className="text-slate-400" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                setCurrentFolderId(null)
                setSelectedId(null)
              }}
              className={cn(
                'mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-primary-50 hover:text-primary',
                currentFolderId === null &&
                  'bg-primary-50 font-medium text-primary dark:bg-primary/15',
              )}
            >
              <Archive size={15} />
              {labels.allFiles}
              <span className="ml-auto text-[11px] text-slate-400">
                {allFiles.filter((item) => item.type === 'file').length}
              </span>
            </button>
            {folderTree.map((item) => (
              <MediaTree
                key={item.id}
                item={item}
                selectedId={selectedId}
                onSelect={selectItem}
                expanded={expanded}
                toggleExpanded={(id) =>
                  setExpanded((current) => {
                    const next = new Set(current)
                    next.has(id) ? next.delete(id) : next.add(id)
                    return next
                  })
                }
              />
            ))}
          </div>
          <div className="border-t border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-2 flex justify-between text-[11px] text-slate-500">
              <span>{labels.usedStorage}</span>
              {usagePercent !== null && <span>{usagePercent.toFixed(1)}%</span>}
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
              {usagePercent !== null && (
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${usagePercent}%` }}
                />
              )}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              {used}
              {total ? ` / ${total}` : ''}
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-100">
              {labels.allFilesBreadcrumb}
            </span>
            {breadcrumb.map((part) => (
              <span
                key={part}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <ChevronRight size={13} />
                {part}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="relative min-w-[180px] flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={labels.search}
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-xs dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="all">{labels.allTypes}</option>
              <option value="file">{labels.file}</option>
              <option value="folder">{labels.folder}</option>
            </select>
            <select
              value={sizeFilter}
              onChange={(event) => setSizeFilter(event.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-xs dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="all">{labels.allSizes}</option>
              <option value="small">&lt; 1 MB</option>
              <option value="large">&gt; 1 MB</option>
            </select>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs text-slate-600 hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-300"
            >
              <SlidersHorizontal size={14} />
              {labels.filter}
            </button>
            <button
              type="button"
              onClick={() => {
                setMultiSelect((current) => !current)
                setSelectedIds(new Set())
              }}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs transition-colors',
                multiSelect
                  ? 'border-primary bg-primary-50 text-primary dark:bg-primary/15'
                  : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-300',
              )}
            >
              {multiSelect ? labels.cancelSelect : labels.selectMultiple}
            </button>
            {multiSelect && selectedFiles.length > 0 && (
              <>
                <span className="text-xs text-slate-500">
                  {selectedFiles.length} {labels.selectedCount}
                </span>
                {onDeleteMedia && (
                  <button
                    type="button"
                    onClick={() => void deleteSelected()}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-error px-3 text-xs text-error hover:bg-error/5"
                  >
                    {' '}
                    <Trash2 size={14} />
                    {labels.deleteSelected}
                  </button>
                )}
                <button
                  type="button"
                  onClick={downloadSelected}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-primary px-3 text-xs text-primary hover:bg-primary-50"
                >
                  <Download size={14} />
                  {labels.download}
                </button>
              </>
            )}
            <div className="ml-auto flex rounded-md border border-slate-200 p-0.5 dark:border-slate-600">
              <button
                type="button"
                aria-label={labels.grid}
                onClick={() => setView('grid')}
                className={cn(
                  'rounded p-1.5',
                  view === 'grid' &&
                    'bg-primary-50 text-primary dark:bg-primary/15',
                )}
              >
                <Grid2X2 size={15} />
              </button>
              <button
                type="button"
                aria-label={labels.list}
                onClick={() => setView('list')}
                className={cn(
                  'rounded p-1.5',
                  view === 'list' &&
                    'bg-primary-50 text-primary dark:bg-primary/15',
                )}
              >
                <List size={15} />
              </button>
            </div>
          </div>
          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto p-4',
              view === 'grid'
                ? 'grid content-start grid-cols-4 gap-3 max-[1300px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1'
                : 'space-y-1',
            )}
          >
            {visibleItems.length === 0 && (
              <div className="col-span-full flex min-h-60 items-center justify-center text-sm text-slate-400">
                {labels.noFiles}
              </div>
            )}
            {visibleItems.map((item) => {
              const Icon = getIcon(item)
              const isChecked = selectedIds.has(item.id)
              return view === 'grid' ? (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={cn(
                    'group h-fit min-w-0 rounded-lg border border-slate-200 p-2 text-left transition hover:border-primary hover:shadow-sm dark:border-slate-700',
                    selectedId === item.id &&
                      'border-primary ring-1 ring-primary',
                  )}
                >
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900">
                    <MediaPreview
                      item={item}
                      className="max-h-full max-w-full"
                    />
                    {multiSelect && item.type === 'file' && (
                      <span
                        className={cn(
                          'absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded border bg-white/90 text-[10px]',
                          isChecked
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 text-transparent',
                        )}
                      >
                        <span>✓</span>
                      </span>
                    )}
                    <MoreVertical
                      size={15}
                      className="absolute right-2 top-2 text-slate-400 opacity-0 group-hover:opacity-100"
                    />
                  </div>
                  <div className="mt-2 truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {item.type === 'folder'
                      ? labels.folder
                      : `${formatSize(item.size)} · ${formatDate(item.date)}`}
                  </div>
                </button>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={cn(
                    'flex w-full min-w-0 items-center gap-3 rounded-md border border-transparent px-2 py-2 text-left hover:bg-primary-50 dark:hover:bg-primary/10',
                    selectedId === item.id &&
                      'border-primary bg-primary-50/60 dark:bg-primary/15',
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900">
                    <MediaPreview
                      item={item}
                      className="max-h-full max-w-full"
                    />
                  </div>
                  {multiSelect && item.type === 'file' && (
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px]',
                        isChecked
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 text-transparent',
                      )}
                    >
                      <span>✓</span>
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                    {item.name}
                  </span>
                  <span className="w-20 shrink-0 text-xs text-slate-500">
                    {item.type === 'file'
                      ? formatSize(item.size)
                      : labels.folder}
                  </span>
                  <span className="w-24 shrink-0 text-xs text-slate-500">
                    {formatDate(item.date)}
                  </span>
                  <Icon size={15} className="shrink-0 text-slate-400" />
                </button>
              )
            })}
            {hasMore && onLoadMore && (
              <div className="col-span-full flex justify-center py-3">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="rounded-md border border-primary px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? `${labels.loadMore}...` : labels.loadMore}
                </button>
              </div>
            )}
          </div>
        </main>

        <aside className="min-w-0 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
            {labels.fileInfo}
          </div>
          {selected ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              <div className="p-4">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-slate-50 dark:bg-slate-900">
                  <MediaPreview item={selected} />
                </div>
                <div className="mt-4 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {selected.name}
                </div>
                <span className="mt-2 inline-flex rounded-full bg-primary-50 px-2 py-1 text-[10px] font-medium text-primary dark:bg-primary/15">
                  {selected.type === 'file'
                    ? extension(selected.name).toUpperCase()
                    : labels.folder}
                </span>
              </div>
              <dl className="space-y-3 p-4 text-xs">
                <div>
                  <dt className="text-slate-500">{labels.filePath}</dt>
                  <dd className="mt-1 break-all text-slate-700 dark:text-slate-200">
                    {selected.path}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{labels.fileSize}</dt>
                  <dd className="mt-1 text-slate-700 dark:text-slate-200">
                    {formatSize(selected.size)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{labels.uploadedAt}</dt>
                  <dd className="mt-1 text-slate-700 dark:text-slate-200">
                    {formatDate(selected.date)}
                  </dd>
                </div>
              </dl>
              <div className="p-4">
                <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-100">
                  {labels.actions}
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => downloadFile(selected)}
                    disabled={selected.type !== 'file' || !selected.url}
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Download size={14} />
                    {labels.download}
                  </button>
                  {onRenameMedia && (
                    <button
                      type="button"
                      onClick={() => void renameSelected()}
                      className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <FileText size={14} />
                      {labels.rename}
                    </button>
                  )}
                  {onDeleteMedia && (
                    <button
                      type="button"
                      onClick={() => void deleteSelected()}
                      className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Trash2 size={14} className="text-error" />
                      {labels.delete}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center p-6 text-center text-xs text-slate-400">
              <div>
                <ImageIcon className="mx-auto mb-2" size={28} />
                {labels.selectFile}
              </div>
            </div>
          )}
        </aside>
      </div>
      <div className="sr-only">{storageLabel}</div>
    </div>
  )
}
