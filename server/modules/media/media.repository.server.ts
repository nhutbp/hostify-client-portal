import type { Prisma } from '../../../prisma/generated/client.js'
import { prisma } from '../../db/prisma'
import { getPagination } from '../../common/pagination.server'
import { createId } from '../../common/id.server'
import type {
  CreateMediaFolderInput,
  CreateMediaInput,
  MediaListInput,
  UpdateMediaInput,
} from './media.schemas'

type MediaAccessScope = {
  uploadedById?: string
}

function mediaAccessWhere(scope?: MediaAccessScope): Prisma.MediaWhereInput {
  if (!scope) return {}
  const access: Prisma.MediaWhereInput[] = []
  if (scope.uploadedById) access.push({ uploadedById: scope.uploadedById })
  return access.length ? { OR: access } : { id: { in: [] } }
}

export function findMedia(
  input: MediaListInput,
  storageMode?: 'SOURCE' | 'S3',
  accessScope?: MediaAccessScope,
) {
  const conditions: Prisma.MediaWhereInput[] = [mediaAccessWhere(accessScope)]
  if (input.search) {
    conditions.push({
      OR: [
        { name: { contains: input.search, mode: 'insensitive' } },
        { path: { contains: input.search, mode: 'insensitive' } },
      ],
    })
  }
  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
    ...(storageMode ? { storageMode } : {}),
    ...(input.uploadedById ? { uploadedById: input.uploadedById } : {}),
    ...(input.folder ? { folder: input.folder } : {}),
    ...(input.type
      ? {
          mimeType:
            input.type === 'folder' ? undefined : { startsWith: input.type },
        }
      : {}),
    AND: conditions,
  }

  return Promise.all([
    prisma.media.findMany({
      where,
      ...getPagination(input),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.media.count({ where }),
  ])
}

export function createMediaRecord(
  input: CreateMediaInput & { uploadedById?: string },
) {
  return prisma.media.create({
    data: {
      id: createId(),
      name: input.name,
      originalName: input.originalName,
      path: input.path,
      url: input.url,
      storageMode: input.storageMode,
      mimeType: input.mimeType,
      extension: input.extension,
      size: input.size,
      width: input.width,
      height: input.height,
      folder: input.folder,
      altText: input.altText,
      uploadedById: input.uploadedById,
    },
  })
}

export function findMediaFolders(input: {
  storageMode: 'SOURCE' | 'S3'
  uploadedById?: string
}) {
  return prisma.mediaFolder.findMany({
    where: {
      deletedAt: null,
      storageMode: input.storageMode,
      ...(input.uploadedById ? { createdById: input.uploadedById } : {}),
    },
    orderBy: [{ path: 'asc' }, { name: 'asc' }],
  })
}

export function getMediaStorageUsage(input: {
  storageMode: 'SOURCE' | 'S3'
  uploadedById?: string
}) {
  return prisma.media.aggregate({
    where: {
      deletedAt: null,
      storageMode: input.storageMode,
      ...(input.uploadedById ? { uploadedById: input.uploadedById } : {}),
    },
    _sum: { size: true },
  })
}

export function findMediaFolder(path: string, storageMode: 'SOURCE' | 'S3') {
  return prisma.mediaFolder.findFirst({
    where: {
      path,
      storageMode,
      deletedAt: null,
    },
  })
}

export function createMediaFolderRecord(
  input: CreateMediaFolderInput & {
    path: string
    parentId?: string
    createdById?: string
  },
) {
  return prisma.mediaFolder.create({
    data: {
      id: createId(),
      parentId: input.parentId,
      name: input.name,
      path: input.path,
      storageMode: input.storageMode,
      createdById: input.createdById,
    },
  })
}

export function updateMediaRecord(id: string, input: UpdateMediaInput) {
  return prisma.media.update({
    where: { id },
    data: input,
  })
}

export function changeMediaFolderCount(input: {
  path: string
  storageMode: 'SOURCE' | 'S3'
  delta: number
}) {
  if (input.path === '/') return Promise.resolve()
  return prisma.mediaFolder.updateMany({
    where: {
      path: input.path,
      storageMode: input.storageMode,
      deletedAt: null,
    },
    data: { count: { increment: input.delta } },
  })
}

export function deleteMediaRecord(id: string) {
  return prisma.media.delete({
    where: { id },
  })
}
