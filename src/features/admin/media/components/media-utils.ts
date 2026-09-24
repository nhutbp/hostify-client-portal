import type { LucideIcon } from 'lucide-react'
import { File, FileImage, FileText, Folder } from 'lucide-react'
import type { MediaFolderLike, MediaItem, MediaRecordLike } from './types'

const extensionIcon: Record<string, LucideIcon> = {
  pdf: FileText,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  webp: FileImage,
  svg: FileImage,
}

export function extension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function formatSize(size = 0) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function formatStorageSize(size = 0) {
  if (size < 1024) return `${size} B`
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(2)} MB`
  return `${(size / 1024 ** 3).toFixed(2)} GB`
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function getIcon(item: MediaItem): LucideIcon {
  if (item.type === 'folder') return Folder
  return extensionIcon[extension(item.name)] ?? File
}

export function mediaRecordsToItems(
  records: MediaRecordLike[],
  folderRecords: MediaFolderLike[] = [],
): MediaItem[] {
  const roots: MediaItem[] = []
  const folders = new Map<string, MediaItem>()
  const folderCounts = new Map(
    folderRecords.map((record) => [record.path, record.count]),
  )
  const ensureFolder = (
    folderPath: string,
    folderId?: string,
    createdAt?: string,
  ) => {
    const normalized = folderPath.replace(/^\/+|\/+$/g, '')
    if (!normalized) return null
    const parts = normalized.split('/')
    let parent: MediaItem | undefined
    let path = ''
    parts.forEach((part) => {
      path = `${path}/${part}`
      const id = folderId && path === normalized ? folderId : `folder:${path}`
      let folder = folders.get(id)
      if (!folder) {
        folder = {
          id,
          name: part,
          type: 'folder',
          path,
          date: createdAt ? new Date(createdAt) : new Date(),
          size: folderCounts.get(path) ?? 0,
          children: [],
        }
        folders.set(id, folder)
        if (parent) parent.children?.push(folder)
        else roots.push(folder)
      }
      parent = folder
    })
    return parent
  }
  folderRecords.forEach((record) =>
    ensureFolder(record.path, record.id, record.createdAt),
  )
  const foldersByPath = new Map(
    Array.from(folders.values()).map((folder) => [folder.path, folder]),
  )
  records.forEach((record) => {
    const file: MediaItem = {
      id: record.id,
      name: record.name,
      type: 'file',
      path: record.path,
      date: new Date(record.createdAt),
      size: record.size,
      url: record.url,
      mimeType: record.mimeType,
    }
    const parent = foldersByPath.get(record.folder)
    if (parent) parent.children?.push(file)
    else roots.push(file)
  })
  return roots
}
