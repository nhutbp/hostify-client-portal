export type MediaItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  size?: number
  date: Date
  url?: string
  mimeType?: string
  children?: MediaItem[]
  data?: string
}

export type MediaRecordLike = {
  id: string
  name: string
  path: string
  url: string
  mimeType: string
  size: number
  folder: string
  createdAt: string
}

export type MediaFolderLike = {
  id: string
  name: string
  path: string
  storageMode: 'SOURCE' | 'S3'
  parentId: string | null
  count: number
  createdAt: string
}

export type MediaLabels = {
  allFiles: string
  unclassified: string
  banner: string
  logo: string
  documents: string
  other: string
  trash: string
  allFilesBreadcrumb: string
  search: string
  newFolder: string
  upload: string
  allTypes: string
  allSizes: string
  uploadedAt: string
  filter: string
  list: string
  grid: string
  fileInfo: string
  selectFile: string
  filePath: string
  fileSize: string
  imageSize: string
  uploadedBy: string
  actions: string
  download: string
  rename: string
  move: string
  copyLink: string
  edit: string
  delete: string
  noFiles: string
  usedStorage: string
  manageStorage: string
  fileType: string
  folder: string
  file: string
  loadMore: string
  selectMultiple: string
  cancelSelect: string
  deleteSelected: string
  selectedCount: string
}
