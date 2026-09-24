export type MediaStorageMode = 'SOURCE' | 'S3'

export type MediaSettings = {
  storageMode: MediaStorageMode
  endpoint: string
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle: boolean
  maxUploadSizeMb: number
}

export type MediaRecord = {
  id: string
  name: string
  originalName: string
  path: string
  url: string
  storageMode: MediaStorageMode
  mimeType: string
  extension: string
  size: number
  width: number | null
  height: number | null
  folder: string
  altText: string | null
  createdAt: string
  updatedAt: string
}
