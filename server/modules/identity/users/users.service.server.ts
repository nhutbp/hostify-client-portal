import { v7 as uuidv7 } from 'uuid'
import { Prisma } from '../../../../prisma/generated/client.js'
import { createAppError } from '../../../common/app-error.server'
import {
  requireAuthContext,
  requirePermission,
} from '../../../common/auth-context.server'
import { createPaginationMeta } from '../../../common/pagination.server'
import { prisma } from '../../../db/prisma'
import { hashPassword } from '../auth/shared/password.server'
import { isPermissionCode } from '../../../../shared/permissions'
import {
  ADMIN_ROLE_CODES,
  ROLE_CODES,
  STAFF_ROLE_CODES,
  SYSTEM_ROLE_CODES,
} from '../../../../shared/roles'
import type {
  BulkUpdateAdminUserStatusInput,
  CreateAdminUserInput,
  ListAdminUsersInput,
  ResetAdminUserPasswordInput,
  RevokeAdminUserSessionsInput,
  CreateAdminRoleInput,
  UpdateAdminRoleInput,
  UpdateAdminUserStatusInput,
  UpdateAdminUserProfileInput,
  UpdateAdminUserRolesInput,
} from './users.schemas'
import { USER_ERROR_CODES, USER_ROLE_ERROR_CODES } from './users.errors'
import { recordAuditLog } from '../../../common/audit/audit.service.server'
import {
  AUDIT_ACTION_CODES,
  AUDIT_SOURCE_CODES,
  AUDIT_TARGETS,
} from '../../../common/audit/audit.constants'
import {
  findAdminUserDetail,
  findAdminUserRelatedData,
  findAdminUsers,
  findAdminUserStatistics,
  findAssignableRoles,
  findAdminPermissions,
  findAdminRoles,
  updateManyUserStatuses,
  updateUserStatusRecord,
} from './users.repository.server'

type AdminRole = 'CUSTOMER' | 'STAFF' | 'ADMIN'
const SYSTEM_ROLE_CODE_SET = new Set<string>(SYSTEM_ROLE_CODES)
const ADMIN_ROLE_CODE_SET = new Set<string>(ADMIN_ROLE_CODES)
const STAFF_ROLE_CODE_SET = new Set<string>(STAFF_ROLE_CODES)

function roleOf(roleCodes: string[]): AdminRole {
  if (roleCodes.some((code) => ADMIN_ROLE_CODE_SET.has(code))) return 'ADMIN'
  if (roleCodes.some((code) => STAFF_ROLE_CODE_SET.has(code))) return 'STAFF'
  return 'CUSTOMER'
}

function statusOf(status: string): 'ACTIVE' | 'BLOCKED' | 'PENDING' {
  if (status === 'ACTIVE' || status === 'BLOCKED') return status
  return 'PENDING'
}

function throwUserNotFound(): never {
  throw createAppError({
    message: 'Không tìm thấy người dùng',
    errorCode: USER_ERROR_CODES.NOT_FOUND,
    statusCode: 404,
  })
}

async function assertAdminTargetCanBeManaged(
  userId: string,
  actorUserId?: string,
) {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      userRoles: { select: { role: { select: { code: true } } } },
    },
  })
  if (!target) throwUserNotFound()
  if (
    actorUserId !== userId &&
    target.userRoles.some(({ role }) => role.code === ROLE_CODES.SUPER_ADMIN)
  )
    throw createAppError({
      message: 'Không thể thay đổi tài khoản Super Admin',
      errorCode: USER_ERROR_CODES.SUPER_ADMIN_PROTECTED,
      statusCode: 403,
    })
  return target
}

export async function listAdminUsers(input: ListAdminUsersInput) {
  await requirePermission('user.user.view')
  const result = await findAdminUsers(input)
  const items = result.items.map((user) => {
    const roleCodes = user.userRoles.map(({ role }) => role.code)
    return {
      id: user.id,
      code: user.code,
      name: user.userProfile?.fullName ?? user.displayName,
      email: user.email,
      phone: user.userProfile?.phone ?? user.phone,
      avatarUrl: user.userProfile?.avatarUrl ?? null,
      role: roleOf(roleCodes),
      status: statusOf(user.status),
      lastLoginAt: user.sessions[0]?.createdAt ?? null,
    }
  })

  return { items, meta: createPaginationMeta(result.total, input) }
}

export async function getAdminUserStatistics() {
  await requirePermission('user.user.view')
  const { users, newUsers } = await findAdminUserStatistics()
  const roles = { CUSTOMER: 0, STAFF: 0, ADMIN: 0 }
  for (const user of users) {
    const roleCodes = user.userRoles.map(({ role }) => role.code)
    roles[roleOf(roleCodes)] += 1
  }
  return {
    total: users.length,
    active: users.filter(({ status }) => status === 'ACTIVE').length,
    blocked: users.filter(({ status }) => status === 'BLOCKED').length,
    pending: users.filter(
      ({ status }) => status !== 'ACTIVE' && status !== 'BLOCKED',
    ).length,
    newUsers,
    roles,
  }
}

export async function getAdminUserDetail(id: string) {
  const { user: authUser } = await requireAuthContext()
  if (authUser.id !== id) await requirePermission('user.user.view')
  const [user, related] = await Promise.all([
    findAdminUserDetail(id),
    findAdminUserRelatedData(id),
  ])
  if (!user) throwUserNotFound()
  const permissions = new Map<
    string,
    { code: string; name: string; description: string | null }
  >()
  for (const { role } of user.userRoles) {
    for (const { permission } of role.permissions)
      permissions.set(permission.code, permission)
  }
  return {
    id: user.id,
    code: user.code,
    login: user.login,
    displayName: user.displayName,
    email: user.email,
    phone: user.userProfile?.phone ?? user.phone,
    avatarUrl: user.userProfile?.avatarUrl ?? null,
    birthDate: user.userProfile?.birthDate?.toISOString().slice(0, 10),
    gender: user.userProfile?.gender ?? 'UNDISCLOSED',
    status: statusOf(user.status),
    roleCodes: user.userRoles.map(({ role }) => role.code),
    isSuperAdmin: user.userRoles.some(
      ({ role }) => role.code === ROLE_CODES.SUPER_ADMIN,
    ),
    permissions: [...permissions.values()],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.sessions[0]?.createdAt ?? null,
    addresses: user.addresses,
    sessions: user.sessions,
    activities: related.auditLogs,
  }
}

export async function resetAdminUserPassword(
  input: ResetAdminUserPasswordInput,
) {
  const { user } = await requirePermission('user.user.update')
  await assertAdminTargetCanBeManaged(input.id, user.id)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.id },
      data: { password: await hashPassword(input.password) },
    }),
    prisma.session.updateMany({
      where: { userId: input.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        id: uuidv7(),
        actorUserId: user.id,
        action: 'USER_PASSWORD_RESET',
        entityType: 'User',
        entityId: input.id,
      },
    }),
  ])
  return { id: input.id }
}

export async function revokeAdminUserSessions(
  input: RevokeAdminUserSessionsInput,
) {
  const { user } = await requirePermission('user.user.update')
  await assertAdminTargetCanBeManaged(input.id, user.id)
  const result = await prisma.$transaction(async (tx) => {
    const revoked = await tx.session.updateMany({
      where: {
        userId: input.id,
        revokedAt: null,
        ...(input.sessionId ? { id: input.sessionId } : {}),
      },
      data: { revokedAt: new Date() },
    })
    await tx.auditLog.create({
      data: {
        id: uuidv7(),
        actorUserId: user.id,
        action: 'USER_SESSIONS_REVOKED',
        entityType: 'User',
        entityId: input.id,
        after: { sessionId: input.sessionId ?? null, count: revoked.count },
      },
    })
    return revoked
  })
  return { count: result.count }
}

export async function getAdminAssignableRoles() {
  await requirePermission('user.role.view')
  const roles = await findAssignableRoles()
  return roles.map((role) => ({
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    permissions: role.permissions.map(({ permission }) => permission),
  }))
}

export async function getAdminRoleManagement() {
  await requirePermission('user.role.view')
  const [roles, permissions, userCount] = await Promise.all([
    findAdminRoles(),
    findAdminPermissions(),
    prisma.user.count(),
  ])
  return {
    stats: {
      roles: roles.length,
      users: userCount,
      permissions: permissions.length,
      customRoles: roles.filter(({ code }) => !SYSTEM_ROLE_CODE_SET.has(code))
        .length,
    },
    permissions,
    roles: roles.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      canAccessDashboard: role.canAccessDashboard,
      isSystem: SYSTEM_ROLE_CODE_SET.has(role.code),
      userCount: role._count.userRoles,
      permissionCount: role._count.permissions,
      permissionCodes: role.permissions.map(
        ({ permission }) => permission.code,
      ),
      users: role.userRoles.map(({ user }) => ({
        id: user.id,
        name: user.displayName,
        email: user.email,
        avatarUrl: user.userProfile?.avatarUrl ?? null,
      })),
    })),
  }
}

async function validatePermissionCodes(codes: string[]) {
  if (codes.some((code) => !isPermissionCode(code)))
    throw createAppError({
      message: 'Có quyền hệ thống không hợp lệ',
      errorCode: USER_ERROR_CODES.PERMISSION_NOT_FOUND,
      statusCode: 400,
    })
  const permissions = await prisma.permission.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true },
  })
  if (permissions.length !== new Set(codes).size)
    throw createAppError({
      message: 'Có quyền hệ thống không hợp lệ',
      errorCode: USER_ERROR_CODES.PERMISSION_NOT_FOUND,
      statusCode: 400,
    })
  return permissions
}

export async function createAdminRole(input: CreateAdminRoleInput) {
  const { user } = await requirePermission('user.role.create')
  const permissions = await validatePermissionCodes(input.permissionCodes)
  try {
    await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          id: uuidv7(),
          code: input.code,
          name: input.name,
          description: input.description || null,
          canAccessDashboard: input.canAccessDashboard,
          permissions: {
            create: permissions.map(({ id }) => ({ permissionId: id })),
          },
        },
      })
      await tx.auditLog.create({
        data: {
          id: uuidv7(),
          actorUserId: user.id,
          module: 'user',
          resource: 'role',
          action: 'CREATE',
          entityType: 'user.role',
          entityId: role.id,
          after: {
            code: role.code,
            name: role.name,
            description: role.description,
            canAccessDashboard: role.canAccessDashboard,
            permissionCodes: input.permissionCodes,
          },
        },
      })
    })
    return getAdminRoleManagement()
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      throw createAppError({
        message: 'Mã vai trò đã tồn tại',
        errorCode: USER_ROLE_ERROR_CODES.CODE_EXISTS,
        statusCode: 409,
      })
    throw error
  }
}

export async function updateAdminRole(input: UpdateAdminRoleInput) {
  const { user } = await requirePermission('user.role.update')
  const role = await prisma.role.findUnique({
    where: { id: input.id },
    include: {
      permissions: { include: { permission: { select: { code: true } } } },
    },
  })
  if (!role)
    throw createAppError({
      message: 'Không tìm thấy vai trò',
      errorCode: USER_ROLE_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  const permissions = await validatePermissionCodes(input.permissionCodes)
  await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id: input.id },
      data: {
        name: input.name,
        code: SYSTEM_ROLE_CODE_SET.has(role.code) ? role.code : input.code,
        description: input.description || null,
        canAccessDashboard:
          role.code === ROLE_CODES.SUPER_ADMIN
            ? true
            : input.canAccessDashboard,
      },
    })
    await tx.rolePermission.deleteMany({ where: { roleId: input.id } })
    await tx.rolePermission.createMany({
      data: permissions.map(({ id }) => ({
        roleId: input.id,
        permissionId: id,
      })),
    })
    await tx.auditLog.create({
      data: {
        id: uuidv7(),
        actorUserId: user.id,
        module: 'user',
        resource: 'role',
        action: 'UPDATE',
        entityType: 'user.role',
        entityId: input.id,
        before: {
          code: role.code,
          name: role.name,
          description: role.description,
          canAccessDashboard: role.canAccessDashboard,
          permissionCodes: role.permissions.map(
            ({ permission }) => permission.code,
          ),
        },
        after: {
          code: SYSTEM_ROLE_CODE_SET.has(role.code) ? role.code : input.code,
          name: input.name,
          description: input.description || null,
          canAccessDashboard:
            role.code === ROLE_CODES.SUPER_ADMIN
              ? true
              : input.canAccessDashboard,
          permissionCodes: input.permissionCodes,
        },
      },
    })
  })
  return getAdminRoleManagement()
}

export async function deleteAdminRole(id: string) {
  const { user } = await requirePermission('user.role.delete')
  const role = await prisma.role.findUnique({
    where: { id },
    select: {
      code: true,
      name: true,
      description: true,
      canAccessDashboard: true,
      permissions: { select: { permission: { select: { code: true } } } },
      _count: { select: { userRoles: true } },
    },
  })
  if (!role)
    throw createAppError({
      message: 'Không tìm thấy vai trò',
      errorCode: USER_ROLE_ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    })
  if (SYSTEM_ROLE_CODE_SET.has(role.code))
    throw createAppError({
      message: 'Không thể xóa vai trò hệ thống',
      errorCode: USER_ROLE_ERROR_CODES.SYSTEM_PROTECTED,
      statusCode: 403,
    })
  if (role._count.userRoles)
    throw createAppError({
      message: 'Không thể xóa vai trò đang được gán cho người dùng',
      errorCode: USER_ROLE_ERROR_CODES.IN_USE,
      statusCode: 409,
    })
  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        id: uuidv7(),
        actorUserId: user.id,
        module: 'user',
        resource: 'role',
        action: 'DELETE',
        entityType: 'user.role',
        entityId: id,
        before: {
          code: role.code,
          name: role.name,
          description: role.description,
          canAccessDashboard: role.canAccessDashboard,
          permissionCodes: role.permissions.map(
            ({ permission }) => permission.code,
          ),
        },
      },
    })
    await tx.role.delete({ where: { id } })
  })
  return { id }
}

export async function updateAdminUserProfile(
  input: UpdateAdminUserProfileInput,
) {
  const { user } = await requirePermission('user.user.update')
  await assertAdminTargetCanBeManaged(input.id, user.id)
  const phone = input.phone?.trim() || null
  const before = await prisma.user.findUnique({
    where: { id: input.id },
    select: {
      displayName: true,
      email: true,
      phone: true,
      userProfile: {
        select: { avatarUrl: true, birthDate: true, gender: true },
      },
    },
  })
  if (!before) throwUserNotFound()
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: input.id },
        data: {
          displayName: input.displayName,
          email: input.email,
          phone,
        },
      })
      await tx.userProfile.upsert({
        where: { userId: input.id },
        create: {
          id: uuidv7(),
          userId: input.id,
          fullName: input.displayName,
          phone,
          avatarUrl: input.avatarUrl?.trim() || null,
          birthDate: input.birthDate
            ? new Date(`${input.birthDate}T00:00:00.000Z`)
            : null,
          gender: input.gender,
        },
        update: {
          fullName: input.displayName,
          phone,
          avatarUrl: input.avatarUrl?.trim() || null,
          birthDate: input.birthDate
            ? new Date(`${input.birthDate}T00:00:00.000Z`)
            : null,
          gender: input.gender,
        },
      })
    })
    await recordAuditLog({
      actorUserId: user.id,
      module: AUDIT_TARGETS.USER.MODULE,
      resource: AUDIT_TARGETS.USER.PROFILE,
      action: AUDIT_ACTION_CODES.UPDATE,
      entityId: input.id,
      before: {
        displayName: before.displayName,
        email: before.email,
        phone: before.phone,
        avatarUrl: before.userProfile?.avatarUrl ?? null,
        birthDate: before.userProfile?.birthDate?.toISOString() ?? null,
        gender: before.userProfile?.gender ?? null,
      },
      after: {
        displayName: input.displayName,
        email: input.email,
        phone,
        avatarUrl: input.avatarUrl?.trim() || null,
        birthDate: input.birthDate ?? null,
        gender: input.gender,
      },
      source: AUDIT_SOURCE_CODES.ADMIN,
    })
    return getAdminUserDetail(input.id)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw createAppError({
        message: 'Email hoặc số điện thoại đã được sử dụng',
        errorCode: USER_ERROR_CODES.CONTACT_ALREADY_EXISTS,
        statusCode: 409,
      })
    }
    throw error
  }
}

export async function updateAdminUserRoles(input: UpdateAdminUserRolesInput) {
  const { user: currentUser } = await requirePermission('user.user.approve')
  const target = await prisma.user.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      userRoles: { select: { role: { select: { code: true } } } },
    },
  })
  if (!target) throwUserNotFound()
  if (
    target.userRoles.some(({ role }) => role.code === ROLE_CODES.SUPER_ADMIN)
  ) {
    throw createAppError({
      message: 'Không thể thay đổi phân quyền của Super Admin',
      errorCode: USER_ERROR_CODES.SUPER_ADMIN_PROTECTED,
      statusCode: 403,
    })
  }
  const roles = await prisma.role.findMany({
    where: {
      code: { in: input.roleCodes, not: ROLE_CODES.SUPER_ADMIN },
    },
    select: {
      id: true,
      code: true,
      permissions: {
        select: { permission: { select: { code: true } } },
      },
    },
  })
  if (roles.length !== new Set(input.roleCodes).size) {
    throw createAppError({
      message: 'Có vai trò không hợp lệ',
      errorCode: USER_ROLE_ERROR_CODES.NOT_FOUND,
      statusCode: 400,
    })
  }
  if (
    currentUser.id === input.id &&
    !roles.some((role) =>
      role.permissions.some(
        ({ permission }) => permission.code === 'user.user.approve',
      ),
    )
  ) {
    throw createAppError({
      message: 'Bạn không thể tự gỡ quyền quản lý người dùng của mình',
      errorCode: USER_ERROR_CODES.CANNOT_REMOVE_OWN_ADMIN_PERMISSION,
      statusCode: 400,
    })
  }
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId: input.id } })
    await tx.userRole.createMany({
      data: roles.map((role) => ({ userId: input.id, roleId: role.id })),
    })
    await tx.auditLog.create({
      data: {
        id: uuidv7(),
        actorUserId: currentUser.id,
        action: 'USER_ROLES_UPDATED',
        entityType: 'User',
        entityId: input.id,
        before: {
          roleCodes: target.userRoles.map(({ role }) => role.code),
        },
        after: { roleCodes: roles.map(({ code }) => code) },
      },
    })
  })
  return getAdminUserDetail(input.id)
}

export async function createAdminUser(input: CreateAdminUserInput) {
  const { user: actor } = await requirePermission('user.user.create')
  try {
    const role = await prisma.role.findUnique({
      where: { code: input.roleCode },
    })
    if (!role)
      throw createAppError({
        message: 'Vai trò không tồn tại',
        errorCode: USER_ROLE_ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      })
    const userId = uuidv7()
    const phone = input.phone?.trim() || null
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          login: input.login,
          displayName: input.displayName,
          email: input.email,
          phone,
          password: await hashPassword(input.password),
          status: input.status === 'PENDING' ? 'UNVERIFY' : input.status,
          code: `USER-${uuidv7().replace(/-/g, '').slice(0, 12).toUpperCase()}`,
          userProfile: {
            create: { id: uuidv7(), fullName: input.displayName, phone },
          },
          userRoles: { create: { roleId: role.id } },
        },
        select: { id: true, code: true, displayName: true, email: true },
      })
      return user
    })
    await recordAuditLog({
      actorUserId: actor.id,
      module: 'user',
      resource: 'user',
      action: 'CREATE',
      entityId: created.id,
      after: {
        code: created.code,
        displayName: created.displayName,
        email: created.email,
      },
      source: 'admin',
    })
    return created
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw createAppError({
        message: 'Tên đăng nhập, email hoặc số điện thoại đã tồn tại',
        errorCode: USER_ERROR_CODES.ALREADY_EXISTS,
        statusCode: 409,
      })
    }
    throw error
  }
}

export async function updateAdminUserStatus(input: UpdateAdminUserStatusInput) {
  const { user } = await requirePermission('user.user.approve')
  if (user.id === input.id && input.status === 'BLOCKED') {
    throw createAppError({
      message: 'Bạn không thể khóa tài khoản đang đăng nhập',
      errorCode: USER_ERROR_CODES.CANNOT_BLOCK_SELF,
      statusCode: 400,
    })
  }
  await assertAdminTargetCanBeManaged(input.id, user.id)
  const before = await prisma.user.findUnique({
    where: { id: input.id },
    select: { status: true },
  })
  const status = input.status === 'PENDING' ? 'UNVERIFY' : input.status
  const updated = await updateUserStatusRecord(input.id, status)
  if (status === 'BLOCKED')
    await prisma.session.updateMany({
      where: { userId: input.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'user',
    resource: 'user',
    action: 'STATUS_CHANGE',
    entityId: updated.id,
    before: { status: before ? statusOf(before.status) : null },
    after: { status: statusOf(updated.status) },
    source: 'admin',
  })
  return { id: updated.id, status: statusOf(updated.status) }
}

export async function bulkUpdateAdminUserStatus(
  input: BulkUpdateAdminUserStatusInput,
) {
  const { user } = await requirePermission('user.user.approve')
  const ids =
    input.status === 'BLOCKED'
      ? input.ids.filter((id) => id !== user.id)
      : input.ids
  if (!ids.length)
    throw createAppError({
      message: 'Không có tài khoản hợp lệ để cập nhật',
      errorCode: USER_ERROR_CODES.EMPTY_SELECTION,
      statusCode: 400,
    })
  const protectedCount = await prisma.user.count({
    where: {
      id: { in: ids },
      userRoles: { some: { role: { code: ROLE_CODES.SUPER_ADMIN } } },
    },
  })
  if (protectedCount)
    throw createAppError({
      message: 'Danh sách có tài khoản Super Admin không thể thay đổi',
      errorCode: USER_ERROR_CODES.SUPER_ADMIN_PROTECTED,
      statusCode: 403,
    })
  const status = input.status === 'PENDING' ? 'UNVERIFY' : input.status
  const result = await updateManyUserStatuses(ids, status)
  if (status === 'BLOCKED')
    await prisma.session.updateMany({
      where: { userId: { in: ids }, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'user',
    resource: 'user',
    action: 'STATUS_CHANGE',
    entityId: null,
    after: { userIds: ids, status: statusOf(status) },
    source: 'admin',
  })
  return { count: result.count }
}
