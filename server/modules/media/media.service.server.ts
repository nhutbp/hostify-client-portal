import {
  access,
  mkdir,
  rename,
  statfs,
  unlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { requirePermission } from '../../common/auth-context.server'
import { prisma } from '../../db/prisma'
import type { MediaStorageMode } from '../../../prisma/generated/client.js'
import { createAppError } from '../../common/app-error.server'
import { createId } from '../../common/id.server'
import { createPaginationMeta } from '../../common/pagination.server'
import { recordAuditLog } from '../../common/audit/audit.service.server'
import {
  AUDIT_ACTION_CODES,
  AUDIT_SOURCE_CODES,
  AUDIT_TARGETS,
} from '../../common/audit/audit.constants'
import { ADMIN_ROLE_CODES } from '../../../shared/roles'
import {
  deleteFile,
  moveFile,
  uploadFile,
} from '../../third-party/s3/s3.service.server'
import {
  createMediaRecord,
  createMediaFolderRecord,
  changeMediaFolderCount,
  deleteMediaRecord,
  findMedia,
  findMediaFolder,
  findMediaFolders,
  getMediaStorageUsage,
  updateMediaRecord,
} from './media.repository.server'
import { MEDIA_ERROR_CODES } from './media.errors'
import type {
  CreateMediaInput,
  MediaListInput,
  CreateMediaFolderInput,
  UpdateMediaInput,
  UpdateMediaSettingsInput,
} from './media.schemas'

const MEDIA_SETTINGS_OPTION = 'media_settings'

const defaultSettings = {
  storageMode: 'SOURCE' as const,
  endpoint: '',
  bucket: '',
  region: '',
  accessKeyId: '',
  secretAccessKey: '',
  forcePathStyle: true,
  maxUploadSizeMb: 10,
}

const sourceRoot = path.join(process.cwd(), 'public', 'images')

function normalizeFolder(folder: string) {
  if (!folder || folder === '.') return '/'
  const value = `/${folder.replace(/^\/+|\/+$/g, '')}`
  if (value.includes('..'))
    throw createAppError({
      message: 'Đường dẫn thư mục không hợp lệ',
      errorCode: MEDIA_ERROR_CODES.INVALID_PATH,
      statusCode: 400,
    })
  return value === '/' ? '/' : value
}

function sourcePath(relativePath: string) {
  const resolved = path.resolve(sourceRoot, relativePath.replace(/^\/+/, ''))
  if (
    resolved !== sourceRoot &&
    !resolved.startsWith(`${sourceRoot}${path.sep}`)
  ) {
    throw createAppError({
      message: 'Đường dẫn file không hợp lệ',
      errorCode: MEDIA_ERROR_CODES.INVALID_PATH,
      statusCode: 400,
    })
  }
  return resolved
}

async function ensureSourceFolder(folder: string, createdById?: string) {
  const normalized = normalizeFolder(folder)
  if (normalized === '/') return
  const parts = normalized.split('/').filter(Boolean)
  let current = ''
  let parentId: string | undefined
  for (const name of parts) {
    current += `/${name}`
    const existing = await findMediaFolder(current, 'SOURCE')
    if (existing) {
      parentId = existing.id
      continue
    }
    const folderRecord = await createMediaFolderRecord({
      name,
      parentPath: parentId
        ? current.slice(0, current.lastIndexOf('/')) || '/'
        : '/',
      storageMode: 'SOURCE',
      path: current,
      parentId,
      createdById,
    })
    parentId = folderRecord.id
  }
}

export async function getMediaSettings() {
  await requirePermission('media.library.view')
  const option = await prisma.option.findUnique({
    where: { optionName: MEDIA_SETTINGS_OPTION },
  })

  if (!option) return defaultSettings

  try {
    return { ...defaultSettings, ...JSON.parse(option.optionValue) }
  } catch {
    return defaultSettings
  }
}

export async function updateMediaSettings(input: UpdateMediaSettingsInput) {
  const { user } = await requirePermission('media.library.update')
  const optionValue = JSON.stringify(input)
  await prisma.option.upsert({
    where: { optionName: MEDIA_SETTINGS_OPTION },
    create: {
      optionName: MEDIA_SETTINGS_OPTION,
      optionValue,
      autoload: true,
    },
    update: { optionValue },
  })

  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.MEDIA.MODULE,
    resource: AUDIT_TARGETS.MEDIA.LIBRARY,
    action: AUDIT_ACTION_CODES.UPDATE,
    after: input,
    source: AUDIT_SOURCE_CODES.ADMIN,
  })

  return input
}

function mapMedia(item: {
  id: string
  name: string
  originalName: string
  path: string
  url: string
  storageMode: MediaStorageMode
  mimeType: string
  extension: string
  size: bigint
  width: number | null
  height: number | null
  folder: string
  altText: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...item,
    size: Number(item.size),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export async function listMedia(input: MediaListInput) {
  const { user, roleCodes } = await requirePermission('media.library.view')
  const canViewAllMedia = roleCodes.some((roleCode) =>
    ADMIN_ROLE_CODES.includes(roleCode as (typeof ADMIN_ROLE_CODES)[number]),
  )
  const accessScope = canViewAllMedia
    ? undefined
    : {
        uploadedById: user.id,
      }
  const settings = await getMediaSettings()
  if (settings.storageMode === 'SOURCE')
    await mkdir(sourceRoot, { recursive: true })
  const [items, total] = await findMedia(
    input,
    settings.storageMode,
    accessScope,
  )
  const usage = await getMediaStorageUsage({
    storageMode: settings.storageMode,
    uploadedById: canViewAllMedia ? input.uploadedById : user.id,
  })
  const filesystem =
    settings.storageMode === 'SOURCE' ? await statfs(sourceRoot) : null
  const uploaderRows = await prisma.media.findMany({
    where: {
      deletedAt: null,
      storageMode: settings.storageMode,
      ...(input.uploadedById && !accessScope
        ? { uploadedById: input.uploadedById }
        : {}),
      ...(accessScope ? { uploadedById: accessScope.uploadedById } : {}),
    },
    distinct: ['uploadedById'],
    select: { uploadedById: true },
  })
  const uploaderIds = uploaderRows
    .map((row) => row.uploadedById)
    .filter((id): id is string => Boolean(id))
  const uploaders = uploaderIds.length
    ? await prisma.user.findMany({
        where: { id: { in: uploaderIds } },
        select: { id: true, displayName: true },
      })
    : []
  return {
    items: items.map(mapMedia),
    folders: (
      await findMediaFolders({
        storageMode: settings.storageMode,
        uploadedById: canViewAllMedia ? input.uploadedById : user.id,
      })
    ).map((folder) => ({
      id: folder.id,
      name: folder.name,
      path: folder.path,
      storageMode: folder.storageMode,
      parentId: folder.parentId,
      count: folder.count,
      createdAt: folder.createdAt.toISOString(),
    })),
    storage: {
      usedBytes: Number(usage._sum.size ?? 0),
      totalBytes: filesystem
        ? Number(filesystem.blocks * filesystem.bsize)
        : null,
    },
    uploaders,
    meta: createPaginationMeta(total, input),
  }
}

export async function createMedia(input: CreateMediaInput) {
  const { user } = await requirePermission('media.library.create')
  const settings = await getMediaSettings()
  const folder = normalizeFolder(input.folder)
  const maxUploadSize = settings.maxUploadSizeMb * 1024 * 1024
  if (input.data && Buffer.from(input.data, 'base64').length > maxUploadSize) {
    throw createAppError({
      message: `File không được vượt quá ${settings.maxUploadSizeMb} MB`,
      errorCode: MEDIA_ERROR_CODES.FILE_TOO_LARGE,
      statusCode: 400,
    })
  }
  let mediaInput = { ...input, folder, uploadedById: user.id }
  if (settings.storageMode === 'SOURCE') {
    await ensureSourceFolder(folder, user.id)
    if (input.data) {
      const extension = path.posix.extname(input.name)
      const baseName = path.posix.basename(input.name, extension)
      const originalRelativePath = path.posix.join(folder, input.name)
      let storedRelativePath = originalRelativePath
      const existingRecord = await prisma.media.findFirst({
        where: {
          path: `/images/${originalRelativePath.replace(/^\//, '')}`,
          storageMode: 'SOURCE',
          deletedAt: null,
        },
      })
      let fileExists = false
      try {
        await access(sourcePath(originalRelativePath))
        fileExists = true
      } catch {
        fileExists = false
      }
      if (existingRecord || fileExists) {
        storedRelativePath = path.posix.join(
          folder,
          `${baseName}-${createId()}${extension}`,
        )
      }
      const filePath = sourcePath(storedRelativePath)
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(filePath, Buffer.from(input.data, 'base64'))
      mediaInput = {
        ...mediaInput,
        path: `/images/${storedRelativePath.replace(/^\//, '')}`,
        url: `/images/${storedRelativePath.replace(/^\//, '')}`,
      }
    }
  } else if (input.data) {
    const uploaded = await uploadFile({
      data: input.data,
      fileName: input.name,
      contentType: input.mimeType,
      folder,
      maxSize: maxUploadSize,
      config: {
        endpoint: settings.endpoint,
        bucket: settings.bucket,
        region: settings.region,
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
        forcePathStyle: settings.forcePathStyle,
      },
    })
    mediaInput = { ...mediaInput, path: uploaded.key, url: uploaded.url }
  }
  const created = await createMediaRecord(mediaInput)
  await changeMediaFolderCount({
    path: folder,
    storageMode: settings.storageMode,
    delta: 1,
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.MEDIA.MODULE,
    resource: AUDIT_TARGETS.MEDIA.LIBRARY,
    action: AUDIT_ACTION_CODES.CREATE,
    entityId: created.id,
    after: { name: created.name, path: created.path, folder: created.folder },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return mapMedia(created)
}

export async function createMediaFolder(input: CreateMediaFolderInput) {
  const { user } = await requirePermission('media.library.create')
  const parentPath = normalizeFolder(input.parentPath)
  const folderPath = normalizeFolder(path.posix.join(parentPath, input.name))
  const existing = await findMediaFolder(folderPath, input.storageMode)
  if (existing) return existing
  if (input.storageMode === 'SOURCE')
    await mkdir(sourcePath(folderPath), { recursive: true })
  if (input.storageMode === 'SOURCE')
    await ensureSourceFolder(parentPath, user.id)
  const parent =
    parentPath === '/'
      ? null
      : await findMediaFolder(parentPath, input.storageMode)
  const folder = await createMediaFolderRecord({
    ...input,
    path: folderPath,
    parentId: parent?.id,
    createdById: user.id,
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.MEDIA.MODULE,
    resource: AUDIT_TARGETS.MEDIA.FOLDER,
    action: AUDIT_ACTION_CODES.CREATE,
    entityId: folder.id,
    after: { name: folder.name, path: folder.path },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return folder
}

export async function updateMedia(id: string, input: UpdateMediaInput) {
  const { user } = await requirePermission('media.library.update')
  const existing = await prisma.media.findFirst({
    where: { id, deletedAt: null },
  })
  if (!existing) {
    throw createAppError({
      message: 'Media không tồn tại',
      errorCode: MEDIA_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  }
  const settings = await getMediaSettings()
  const name = input.name ?? existing.name
  const folder = normalizeFolder(input.folder ?? existing.folder)
  let nextPath =
    settings.storageMode === 'SOURCE'
      ? `/images/${path.posix.join(folder, name).replace(/^\//, '')}`
      : path.posix.join(folder, name).replace(/^\//, '')

  if (settings.storageMode === 'SOURCE' && nextPath !== existing.path) {
    const collision = await prisma.media.findFirst({
      where: {
        id: { not: id },
        path: nextPath,
        storageMode: 'SOURCE',
        deletedAt: null,
      },
    })
    if (collision) {
      const extension = path.posix.extname(name)
      const baseName = path.posix.basename(name, extension)
      const storedName = `${baseName}-${createId()}${extension}`
      nextPath = `/images/${path.posix.join(folder, storedName).replace(/^\//, '')}`
    }
  }

  if (nextPath !== existing.path) {
    if (settings.storageMode === 'SOURCE') {
      await mkdir(
        path.dirname(sourcePath(nextPath.replace(/^\/images\//, '/'))),
        { recursive: true },
      )
      try {
        await rename(
          sourcePath(existing.path.replace(/^\/images\//, '/')),
          sourcePath(nextPath.replace(/^\/images\//, '/')),
        )
      } catch {
        throw createAppError({
          message: 'Không thể đổi tên file trên source',
          errorCode: MEDIA_ERROR_CODES.RENAME_FAILED,
          statusCode: 500,
        })
      }
    } else {
      await moveFile({
        fromKey: existing.path,
        toKey: nextPath,
        config: {
          endpoint: settings.endpoint,
          bucket: settings.bucket,
          region: settings.region,
          accessKeyId: settings.accessKeyId,
          secretAccessKey: settings.secretAccessKey,
          forcePathStyle: settings.forcePathStyle,
        },
      })
    }
  }

  if (folder !== existing.folder) {
    await changeMediaFolderCount({
      path: existing.folder,
      storageMode: existing.storageMode,
      delta: -1,
    })
    await changeMediaFolderCount({
      path: folder,
      storageMode: existing.storageMode,
      delta: 1,
    })
  }

  const updated = await updateMediaRecord(id, {
    ...input,
    name,
    folder,
    path: nextPath,
    url:
      settings.storageMode === 'SOURCE'
        ? nextPath
        : `${settings.endpoint.replace(/\/$/, '')}/${settings.bucket}/${nextPath}`,
  } as UpdateMediaInput)
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.MEDIA.MODULE,
    resource: AUDIT_TARGETS.MEDIA.LIBRARY,
    action: AUDIT_ACTION_CODES.UPDATE,
    entityId: id,
    before: {
      name: existing.name,
      path: existing.path,
      folder: existing.folder,
    },
    after: { name: updated.name, path: updated.path, folder: updated.folder },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return mapMedia(updated)
}

export async function deleteMedia(id: string) {
  const { user } = await requirePermission('media.library.delete')
  const existing = await prisma.media.findFirst({
    where: { id, deletedAt: null },
  })
  if (!existing) {
    throw createAppError({
      message: 'Media không tồn tại',
      errorCode: MEDIA_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  }
  const settings = await getMediaSettings()
  const duplicateCount = await prisma.media.count({
    where: {
      id: { not: id },
      path: existing.path,
      storageMode: existing.storageMode,
      deletedAt: null,
    },
  })
  try {
    if (duplicateCount === 0 && existing.storageMode === 'SOURCE') {
      await unlink(sourcePath(existing.path.replace(/^\/images\//, '/')))
    } else if (duplicateCount === 0 && existing.storageMode === 'S3') {
      await deleteFile({
        key: existing.path,
        config: {
          endpoint: settings.endpoint,
          bucket: settings.bucket,
          region: settings.region,
          accessKeyId: settings.accessKeyId,
          secretAccessKey: settings.secretAccessKey,
          forcePathStyle: settings.forcePathStyle,
        },
      })
    }
  } catch {
    throw createAppError({
      message: 'Không thể xóa file khỏi nơi lưu trữ',
      errorCode: MEDIA_ERROR_CODES.DELETE_FAILED,
      statusCode: 500,
    })
  }
  const deleted = await deleteMediaRecord(id)
  await changeMediaFolderCount({
    path: existing.folder,
    storageMode: existing.storageMode,
    delta: -1,
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: AUDIT_TARGETS.MEDIA.MODULE,
    resource: AUDIT_TARGETS.MEDIA.LIBRARY,
    action: AUDIT_ACTION_CODES.DELETE,
    entityId: id,
    before: {
      name: existing.name,
      path: existing.path,
      folder: existing.folder,
    },
    source: AUDIT_SOURCE_CODES.ADMIN,
  })
  return mapMedia(deleted)
}
