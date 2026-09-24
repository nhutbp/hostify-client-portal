import type { Prisma } from '../../../../prisma/generated/client.js'
import { prisma } from '../../../db/prisma'
import { getPagination } from '../../../common/pagination.server'
import type { ListAdminUsersInput } from './users.schemas'
import {
  ADMIN_ROLE_CODES,
  ROLE_CODES,
  STAFF_ROLE_CODES,
} from '../../../../shared/roles'

function roleWhere(role: ListAdminUsersInput['role']): Prisma.UserWhereInput {
  if (role === 'ADMIN')
    return {
      userRoles: { some: { role: { code: { in: ADMIN_ROLE_CODES } } } },
    }
  if (role === 'STAFF')
    return {
      userRoles: { some: { role: { code: { in: STAFF_ROLE_CODES } } } },
    }
  if (role === 'CUSTOMER')
    return { userRoles: { some: { role: { code: ROLE_CODES.CUSTOMER } } } }
  return {}
}

export async function findAdminUsers(input: ListAdminUsersInput) {
  const roleFilter = roleWhere(input.role)
  const where: Prisma.UserWhereInput = {
    AND: [
      input.search
        ? {
            OR: [
              { displayName: { contains: input.search, mode: 'insensitive' } },
              { email: { contains: input.search, mode: 'insensitive' } },
              { phone: { contains: input.search, mode: 'insensitive' } },
              { code: { contains: input.search, mode: 'insensitive' } },
              { login: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {},
      input.status === 'ACTIVE'
        ? { status: 'ACTIVE' }
        : input.status === 'BLOCKED'
          ? { status: 'BLOCKED' }
          : input.status === 'PENDING'
            ? { status: { notIn: ['ACTIVE', 'BLOCKED'] } }
            : {},
      input.dateFrom || input.dateTo
        ? {
            createdAt: {
              ...(input.dateFrom
                ? { gte: new Date(`${input.dateFrom}T00:00:00.000Z`) }
                : {}),
              ...(input.dateTo
                ? { lte: new Date(`${input.dateTo}T23:59:59.999Z`) }
                : {}),
            },
          }
        : {},
      roleFilter,
    ],
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      ...getPagination(input),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        displayName: true,
        email: true,
        phone: true,
        status: true,
        userProfile: {
          select: { fullName: true, phone: true, avatarUrl: true },
        },
        userRoles: { select: { role: { select: { code: true } } } },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ])
  return { items, total }
}

export function findAdminUserDetail(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      login: true,
      displayName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userProfile: {
        select: {
          fullName: true,
          phone: true,
          avatarUrl: true,
          birthDate: true,
          gender: true,
        },
      },
      userRoles: {
        select: {
          role: {
            select: {
              code: true,
              name: true,
              description: true,
              permissions: {
                select: {
                  permission: {
                    select: { code: true, name: true, description: true },
                  },
                },
              },
            },
          },
        },
      },
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          createdAt: true,
          revokedAt: true,
          accessTokenExpires: true,
          deviceInfo: true,
        },
      },
      addresses: {
        where: { deletedAt: null },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          label: true,
          recipientName: true,
          phone: true,
          provinceName: true,
          districtName: true,
          wardName: true,
          addressLine: true,
          isDefault: true,
        },
      },
    },
  })
}

export async function findAdminUserRelatedData(userId: string) {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [{ entityType: 'User', entityId: userId }, { actorUserId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      action: true,
      entityType: true,
      before: true,
      after: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  })
  return { auditLogs }
}

export function findAssignableRoles() {
  return prisma.role.findMany({
    where: { code: { not: ROLE_CODES.SUPER_ADMIN } },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      permissions: {
        select: {
          permission: {
            select: {
              code: true,
              module: true,
              resource: true,
              action: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  })
}

export function findAdminRoles() {
  return prisma.role.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      canAccessDashboard: true,
      _count: { select: { userRoles: true, permissions: true } },
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              code: true,
              module: true,
              resource: true,
              action: true,
              name: true,
              description: true,
            },
          },
        },
      },
      userRoles: {
        take: 8,
        select: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              userProfile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  })
}

export function findAdminPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    select: {
      id: true,
      code: true,
      module: true,
      resource: true,
      action: true,
      name: true,
      description: true,
    },
  })
}

export function updateUserStatusRecord(id: string, status: string) {
  return prisma.user.update({ where: { id }, data: { status } })
}

export function updateManyUserStatuses(ids: string[], status: string) {
  return prisma.user.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
}

export async function findAdminUserStatistics() {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - 29)

  const [users, newUsers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        userRoles: { select: { role: { select: { code: true } } } },
      },
    }),
    prisma.user.count({
      where: { createdAt: { gte: since } },
    }),
  ])

  return { users, newUsers }
}
