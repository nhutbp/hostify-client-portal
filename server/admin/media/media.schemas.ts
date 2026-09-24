import { z } from 'zod'

const MEDIA_STORAGE_MODE_VALUES = ['SOURCE', 'S3'] as const
const MEDIA_ENTRY_TYPE_VALUES = ['file', 'folder'] as const

export const mediaStorageModeSchema = z.enum(MEDIA_STORAGE_MODE_VALUES)

export const updateMediaSettingsSchema = z.object({
  storageMode: mediaStorageModeSchema,
  endpoint: z.string().trim().url().optional().or(z.literal('')),
  bucket: z.string().trim().max(255).optional(),
  region: z.string().trim().max(100).optional(),
  accessKeyId: z.string().trim().max(255).optional(),
  secretAccessKey: z.string().max(500).optional(),
  forcePathStyle: z.boolean().default(true),
  maxUploadSizeMb: z.number().int().min(1).max(10240).default(10),
})

export const mediaListSchema = z.object({
  uploadedById: z.string().uuid().optional(),
  folder: z.string().trim().max(500).optional(),
  search: z.string().trim().max(100).optional().default(''),
  type: z.enum(MEDIA_ENTRY_TYPE_VALUES).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export const createMediaSchema = z.object({
  name: z.string().trim().min(1).max(255),
  originalName: z.string().trim().min(1).max(255),
  path: z.string().trim().min(1).max(1000),
  url: z.string().trim().min(1).max(2000),
  storageMode: mediaStorageModeSchema,
  mimeType: z.string().trim().min(1).max(150),
  extension: z.string().trim().max(20),
  size: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  folder: z.string().trim().max(500).default('/'),
  altText: z.string().trim().max(500).optional(),
  data: z.string().optional(),
})

export const createMediaFolderSchema = z.object({
  name: z.string().trim().min(1).max(255),
  parentPath: z.string().trim().max(500).default('/'),
  storageMode: mediaStorageModeSchema,
})

export const updateMediaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(255).optional(),
  folder: z.string().trim().max(500).optional(),
  altText: z.string().trim().max(500).optional(),
})

export const mediaIdSchema = z.object({ id: z.string().uuid() })

export type UpdateMediaSettingsInput = z.infer<typeof updateMediaSettingsSchema>
export type MediaListInput = z.infer<typeof mediaListSchema>
export type CreateMediaInput = z.infer<typeof createMediaSchema>
export type CreateMediaFolderInput = z.infer<typeof createMediaFolderSchema>
export type UpdateMediaInput = Omit<z.infer<typeof updateMediaSchema>, 'id'>
