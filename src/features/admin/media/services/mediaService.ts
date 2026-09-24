import {
  getAdminMediaSettings,
  updateAdminMediaSettings,
  createAdminMedia,
  deleteAdminMedia,
  getAdminMedia,
  createAdminMediaFolder,
  updateAdminMedia,
} from '../../../../../server/modules/media/media'
import type {
  CreateMediaInput,
  CreateMediaFolderInput,
  MediaListInput,
  UpdateMediaInput,
  UpdateMediaSettingsInput,
} from '../../../../../server/modules/media/media.schemas'
import { unwrapSuccessResponse } from '@/utils/response'
import type { MediaRecord, MediaSettings } from '../types'

export type MediaListResult = {
  items: MediaRecord[]
  folders: Array<{
    id: string
    name: string
    path: string
    storageMode: 'SOURCE' | 'S3'
    parentId: string | null
    count: number
    createdAt: string
  }>
  uploaders: Array<{ id: string; displayName: string }>
  storage: {
    usedBytes: number
    totalBytes: number | null
  }
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
}

export const mediaService = {
  list: async (input: MediaListInput): Promise<MediaListResult> =>
    unwrapSuccessResponse(await getAdminMedia({ data: input })),
  create: async (input: CreateMediaInput) =>
    unwrapSuccessResponse(await createAdminMedia({ data: input })),
  createFolder: async (input: CreateMediaFolderInput) =>
    unwrapSuccessResponse(await createAdminMediaFolder({ data: input })),
  update: async (input: UpdateMediaInput & { id: string }) =>
    unwrapSuccessResponse(await updateAdminMedia({ data: input })),
  delete: async (input: { id: string }) =>
    unwrapSuccessResponse(await deleteAdminMedia({ data: input })),
  getSettings: async (): Promise<MediaSettings> =>
    unwrapSuccessResponse(await getAdminMediaSettings()),
  updateSettings: async (input: UpdateMediaSettingsInput) =>
    unwrapSuccessResponse(await updateAdminMediaSettings({ data: input })),
}
