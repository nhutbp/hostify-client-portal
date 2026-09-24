import { uuidv7 } from 'uuidv7'
import { prisma } from '../../db/prisma'
import type { AuditAction, AuditSource } from './audit.constants'
import type { ModuleCode } from '../../../shared/module-catalog'

const SENSITIVE_KEYS = /password|token|secret|apiKey|cookie|authorization/i

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.test(key) ? '[REDACTED]' : sanitize(item),
    ]),
  )
}

export async function recordAuditLog(input: {
  actorUserId?: string | null
  module: ModuleCode
  resource: string
  action: AuditAction
  entityId?: string | null
  before?: unknown
  after?: unknown
  source?: AuditSource
  reason?: string
}) {
  const before = sanitize(input.before)
  const after = sanitize(input.after)
  const changedFields =
    before && after && typeof before === 'object' && typeof after === 'object'
      ? Object.keys(after as Record<string, unknown>).filter(
          (key) =>
            JSON.stringify((before as Record<string, unknown>)[key]) !==
            JSON.stringify((after as Record<string, unknown>)[key]),
        )
      : undefined

  return prisma.auditLog.create({
    data: {
      id: uuidv7(),
      actorUserId: input.actorUserId ?? null,
      module: input.module,
      resource: input.resource,
      action: input.action,
      entityType: `${input.module}.${input.resource}`,
      entityId: input.entityId ?? null,
      before: before as never,
      after: after as never,
      metadata: {
        source: input.source ?? 'admin',
        reason: input.reason ?? null,
        changedFields: changedFields ?? [],
      } as never,
      ipAddress: null,
      userAgent: null,
    },
  })
}

export async function listAuditLogs(input: {
  page: number
  limit: number
  search?: string
  module?: string
  action?: string
  actorUserId?: string
  from?: string
  to?: string
}) {
  const where = {
    ...(input.module ? { module: input.module } : {}),
    ...(input.action ? { action: input.action } : {}),
    ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
    ...(input.search
      ? {
          OR: [
            {
              entityType: {
                contains: input.search,
                mode: 'insensitive' as const,
              },
            },
            {
              entityId: {
                contains: input.search,
                mode: 'insensitive' as const,
              },
            },
            {
              action: { contains: input.search, mode: 'insensitive' as const },
            },
          ],
        }
      : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: new Date(`${input.from}T00:00:00`) } : {}),
            ...(input.to ? { lte: new Date(`${input.to}T23:59:59.999`) } : {}),
          },
        }
      : {}),
  }
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      select: {
        id: true,
        actorUserId: true,
        action: true,
        entityType: true,
        entityId: true,
        before: true,
        after: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ])
  const actorIds = [
    ...new Set(
      items
        .map((item) => item.actorUserId)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: {
      id: true,
      displayName: true,
    },
  })
  const actorById = new Map(
    actors.map((actor) => [actor.id, actor.displayName]),
  )
  const entityTypes = [...new Set(items.map((item) => item.entityType))]
  const entityIdsByType = new Map<string, string[]>()
  for (const entityType of entityTypes) {
    entityIdsByType.set(
      entityType,
      items
        .filter((item) => item.entityType === entityType && item.entityId)
        .map((item) => item.entityId as string),
    )
  }
  const entities = await Promise.all(
    [...entityIdsByType.entries()].map(async ([entityType, ids]) => {
      const uniqueIds = [...new Set(ids)]
      switch (entityType) {
        case 'post.post': {
          const rows = await prisma.post.findMany({
            where: { id: { in: uniqueIds } },
            select: { id: true, title: true, slug: true },
          })
          return [
            entityType,
            new Map(
              rows.map((row) => [row.id, { name: row.title, slug: row.slug }]),
            ),
          ] as const
        }
        case 'post.post_category':
        case 'post.post_platform': {
          const rows =
            entityType === 'post.post_category'
              ? await prisma.postCategory.findMany({
                  where: { id: { in: uniqueIds } },
                  select: { id: true, name: true, slug: true },
                })
              : await prisma.postPlatform.findMany({
                  where: { id: { in: uniqueIds } },
                  select: { id: true, name: true, slug: true },
                })
          return [
            entityType,
            new Map(
              rows.map((row) => [
                row.id,
                {
                  name: row.name,
                  ...('slug' in row ? { slug: row.slug } : {}),
                },
              ]),
            ),
          ] as const
        }
        case 'appearance.menu': {
          const navigationMenu = (
            prisma as unknown as {
              navigationMenu: {
                findMany: (
                  args: unknown,
                ) => Promise<Array<{ id: string; name: string }>>
              }
            }
          ).navigationMenu
          const rows = await navigationMenu.findMany({
            where: { id: { in: uniqueIds } },
            select: { id: true, name: true },
          })
          return [
            entityType,
            new Map(rows.map((row) => [row.id, { name: row.name }])),
          ] as const
        }
        case 'user.user': {
          const rows = await prisma.user.findMany({
            where: { id: { in: uniqueIds } },
            select: { id: true, code: true, displayName: true },
          })
          return [
            entityType,
            new Map(
              rows.map((row) => [
                row.id,
                { name: row.displayName, code: row.code },
              ]),
            ),
          ] as const
        }
        case 'user.role': {
          const rows = await prisma.role.findMany({
            where: { id: { in: uniqueIds } },
            select: { id: true, code: true, name: true },
          })
          return [
            entityType,
            new Map(
              rows.map((row) => [row.id, { name: row.name, code: row.code }]),
            ),
          ] as const
        }
        default:
          return [entityType, new Map()] as const
      }
    }),
  )
  const entityByType = new Map(entities)
  return {
    items: items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      actor: item.actorUserId
        ? {
            id: item.actorUserId,
            name: actorById.get(item.actorUserId) ?? item.actorUserId,
          }
        : null,
      entity: item.entityId
        ? {
            id: item.entityId,
            ...(entityByType.get(item.entityType)?.get(item.entityId) ?? {
              name: item.entityId,
            }),
          }
        : null,
    })),
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
      hasPrevious: input.page > 1,
      hasNext: input.page < Math.ceil(total / input.limit),
    },
  }
}
