import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '../../db/prisma'
import { requireAuthContext } from '../../common/auth-context.server'
import { createAppError } from '../../common/app-error.server'
import { createId } from '../../common/id.server'
import { API_KEY_ERROR_CODES } from './api-keys.errors'
import type { CreateApiKeyInput } from './api-keys.schemas'
import { recordAuditLog } from '../../common/audit/audit.service.server'

const API_KEY_PREFIX = 'hca_live_'

function hashApiKey(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function toApiKeyView(apiKey: {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: Date | null
  expiresAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}) {
  return {
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
    expiresAt: apiKey.expiresAt?.toISOString().slice(0, 10) ?? null,
    revokedAt: apiKey.revokedAt?.toISOString() ?? null,
    createdAt: apiKey.createdAt.toISOString(),
  }
}

export async function listApiKeys() {
  const { user } = await requireAuthContext()
  const items = await prisma.apiKey.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return items.map(toApiKeyView)
}

export async function createApiKey(input: CreateApiKeyInput) {
  const { user } = await requireAuthContext()
  const secret = `${API_KEY_PREFIX}${randomBytes(32).toString('base64url')}`
  const record = await prisma.apiKey.create({
    data: {
      id: createId(),
      name: input.name,
      keyPrefix: secret.slice(0, 18),
      keyHash: hashApiKey(secret),
      createdById: user.id,
      expiresAt: input.expiresAt
        ? new Date(`${input.expiresAt}T23:59:59.999Z`)
        : null,
    },
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'system',
    resource: 'api_key',
    action: 'CREATE',
    entityId: record.id,
    after: {
      name: record.name,
      keyPrefix: record.keyPrefix,
      expiresAt: record.expiresAt?.toISOString() ?? null,
    },
    source: 'admin',
  })
  return {
    item: toApiKeyView(record),
    secret,
  }
}

export async function revokeApiKey(id: string) {
  const { user } = await requireAuthContext()
  const apiKey = await prisma.apiKey.findFirst({
    where: { id, createdById: user.id, revokedAt: null },
  })
  if (!apiKey) {
    throw createAppError({
      message: 'Không tìm thấy API key đang hoạt động',
      errorCode: API_KEY_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  }
  const revoked = await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'system',
    resource: 'api_key',
    action: 'STATUS_CHANGE',
    entityId: id,
    before: { revokedAt: null },
    after: { revokedAt: revoked.revokedAt?.toISOString() ?? null },
    source: 'admin',
  })
  return revoked
}

export async function authenticateApiKey(secret: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(secret) },
  })
  if (!apiKey) {
    throw createAppError({
      message: 'API key không hợp lệ',
      errorCode: API_KEY_ERROR_CODES.INVALID,
      statusCode: 401,
    })
  }
  if (apiKey.revokedAt) {
    throw createAppError({
      message: 'API key đã bị thu hồi',
      errorCode: API_KEY_ERROR_CODES.REVOKED,
      statusCode: 401,
    })
  }
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw createAppError({
      message: 'API key đã hết hạn',
      errorCode: API_KEY_ERROR_CODES.EXPIRED,
      statusCode: 401,
    })
  }
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })
  return apiKey
}
