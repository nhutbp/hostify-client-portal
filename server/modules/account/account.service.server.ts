import { prisma } from '../../db/prisma'
import { getCurrentUserFromRequest } from '../auth/auth.service.server'
import { unwrapSuccessResponse } from '../../../src/utils/response'
import { createAppError } from '../../common/app-error.server'
import { hashPassword, verifyPassword } from '../auth/shared/password.server'
import type { z } from 'zod'
import type {
  changeAccountPasswordSchema,
  createAccountAddressSchema,
  updateAccountProfileSchema,
} from './account.schemas'
import { ACCOUNT_ERROR_CODES } from './account.errors'
import { recordAuditLog } from '../../common/audit/audit.service.server'

async function requireCurrentUser() {
  const user = unwrapSuccessResponse(await getCurrentUserFromRequest())
  if (!user) throw new Error('Authentication required')
  return user
}

function joinAddress(address: {
  addressLine: string
  wardName?: string | null
  districtName?: string | null
  provinceName?: string | null
}) {
  return [
    address.addressLine,
    address.wardName,
    address.districtName,
    address.provinceName,
  ]
    .filter(Boolean)
    .join(', ')
}

export async function getAccountProfileForCurrentUser() {
  const sessionUser = await requireCurrentUser()
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true,
      createdAt: true,
      userProfile: {
        select: {
          birthDate: true,
          gender: true,
          avatarUrl: true,
        },
      },
    },
  })
  if (!user) throw new Error('Account not found')

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    birthDate: user.userProfile?.birthDate?.toISOString() ?? null,
    gender: user.userProfile?.gender ?? 'UNDISCLOSED',
    tier: 'STANDARD',
    points: 0,
    avatarUrl: user.userProfile?.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function updateProfileForCurrentUser(
  input: z.infer<typeof updateAccountProfileSchema>,
) {
  const user = await requireCurrentUser()
  const duplicate = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      OR: [
        { email: input.email.toLowerCase() },
        ...(input.phone ? [{ phone: input.phone }] : []),
      ],
    },
    select: { id: true },
  })
  if (duplicate) {
    throw createAppError({
      message: 'Email hoặc số điện thoại đã được sử dụng',
      errorCode: ACCOUNT_ERROR_CODES.PROFILE_DUPLICATE,
      statusCode: 409,
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        displayName: input.displayName,
        email: input.email.toLowerCase(),
        login:
          user.userLogin.toLowerCase() === user.userEmail.toLowerCase()
            ? input.email.toLowerCase()
            : undefined,
        phone: input.phone || null,
      },
    })
    await tx.userProfile.upsert({
      where: { userId: user.id },
      create: {
        id: crypto.randomUUID(),
        userId: user.id,
        fullName: input.displayName,
        phone: input.phone || null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        gender: input.gender,
      },
      update: {
        fullName: input.displayName,
        phone: input.phone || null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        gender: input.gender,
      },
    })
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'user',
    resource: 'profile',
    action: 'UPDATE',
    entityId: user.id,
    before: {
      displayName: user.displayName,
      email: user.userEmail,
      phone: user.userPhone,
    },
    after: {
      displayName: input.displayName,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
    },
    source: 'admin',
  })
  return getAccountProfileForCurrentUser()
}

export async function updateAvatarForCurrentUser(avatarUrl: string) {
  const user = await requireCurrentUser()
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      id: crypto.randomUUID(),
      userId: user.id,
      fullName: user.displayName,
      avatarUrl,
    },
    update: { avatarUrl },
  })
  await recordAuditLog({
    actorUserId: user.id,
    module: 'user',
    resource: 'profile',
    action: 'UPDATE',
    entityId: user.id,
    after: { avatarUrl },
    source: 'admin',
  })
  return { avatarUrl }
}

export async function changePasswordForCurrentUser(
  input: z.infer<typeof changeAccountPasswordSchema>,
) {
  const sessionUser = await requireCurrentUser()
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { password: true },
  })
  if (!user || !(await verifyPassword(user.password, input.currentPassword))) {
    throw createAppError({
      message: 'Mật khẩu hiện tại không đúng',
      errorCode: ACCOUNT_ERROR_CODES.CURRENT_PASSWORD_INVALID,
      statusCode: 400,
    })
  }
  if (await verifyPassword(user.password, input.newPassword)) {
    throw createAppError({
      message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
      errorCode: ACCOUNT_ERROR_CODES.PASSWORD_UNCHANGED,
      statusCode: 400,
    })
  }
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { password: await hashPassword(input.newPassword) },
  })
  await recordAuditLog({
    actorUserId: sessionUser.id,
    module: 'user',
    resource: 'password',
    action: 'UPDATE',
    entityId: sessionUser.id,
    after: { changed: true },
    source: 'admin',
  })
  return { ok: true }
}

export async function getMediaForCurrentUser() {
  const sessionUser = await requireCurrentUser()
  const settingsOption = await prisma.option.findUnique({
    where: { optionName: 'media_settings' },
    select: { optionValue: true },
  })
  let storageMode: 'SOURCE' | 'S3' = 'SOURCE'
  if (settingsOption) {
    try {
      const parsed = JSON.parse(settingsOption.optionValue) as {
        storageMode?: 'SOURCE' | 'S3'
      }
      if (parsed.storageMode === 'S3') storageMode = 'S3'
    } catch {
      storageMode = 'SOURCE'
    }
  }
  const [items, folders] = await Promise.all([
    prisma.media.findMany({
      where: { deletedAt: null, storageMode, uploadedById: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.mediaFolder.findMany({
      where: {
        deletedAt: null,
        storageMode,
        createdById: sessionUser.id,
      },
      orderBy: [{ path: 'asc' }, { name: 'asc' }],
    }),
  ])
  return {
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      path: item.path,
      url: item.url,
      mimeType: item.mimeType,
      size: Number(item.size),
      folder: item.folder,
      createdAt: item.createdAt.toISOString(),
    })),
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      path: folder.path,
      storageMode: folder.storageMode,
      parentId: folder.parentId,
      count: folder.count,
      createdAt: folder.createdAt.toISOString(),
    })),
  }
}

export async function getAddressesForCurrentUser() {
  const user = await requireCurrentUser()
  const addresses = await prisma.userAddress.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  })
  return addresses.map((address) => ({
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    address: joinAddress(address),
    isDefault: address.isDefault,
    latitude: address.latitude === null ? null : Number(address.latitude),
    longitude: address.longitude === null ? null : Number(address.longitude),
  }))
}

export async function createAddressForCurrentUser(
  input: z.infer<typeof createAccountAddressSchema>,
) {
  const user = await requireCurrentUser()
  const addressCount = await prisma.userAddress.count({
    where: { userId: user.id, deletedAt: null },
  })
  const isDefault = input.isDefault || addressCount === 0
  return prisma.$transaction(async (transaction) => {
    if (isDefault) {
      await transaction.userAddress.updateMany({
        where: { userId: user.id, deletedAt: null },
        data: { isDefault: false },
      })
    }
    const address = await transaction.userAddress.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        provinceCode: input.provinceCode,
        provinceName: input.provinceName,
        wardCode: input.wardCode,
        wardName: input.wardName,
        addressLine: input.addressLine,
        latitude: input.latitude,
        longitude: input.longitude,
        isDefault,
      },
    })
    await recordAuditLog({
      actorUserId: user.id,
      module: 'user',
      resource: 'address',
      action: 'CREATE',
      entityId: address.id,
      after: {
        label: address.label,
        addressLine: address.addressLine,
        isDefault: address.isDefault,
      },
      source: 'admin',
    })
    return { id: address.id }
  })
}

export async function setDefaultAddressForCurrentUser(addressId: string) {
  const user = await requireCurrentUser()
  const address = await prisma.userAddress.findFirst({
    where: { id: addressId, userId: user.id, deletedAt: null },
    select: { id: true },
  })
  if (!address) throw new Error('Address not found')
  await prisma.$transaction([
    prisma.userAddress.updateMany({
      where: { userId: user.id, deletedAt: null },
      data: { isDefault: false },
    }),
    prisma.userAddress.update({
      where: { id: address.id },
      data: { isDefault: true },
    }),
  ])
  await recordAuditLog({
    actorUserId: user.id,
    module: 'user',
    resource: 'address',
    action: 'UPDATE',
    entityId: address.id,
    after: { isDefault: true },
    source: 'admin',
  })
  return { ok: true }
}

export async function deleteAddressForCurrentUser(addressId: string) {
  const user = await requireCurrentUser()
  const result = await prisma.userAddress.updateMany({
    where: { id: addressId, userId: user.id, deletedAt: null },
    data: { deletedAt: new Date(), isDefault: false },
  })
  if (!result.count) throw new Error('Address not found')
  await recordAuditLog({
    actorUserId: user.id,
    module: 'user',
    resource: 'address',
    action: 'DELETE',
    entityId: addressId,
    after: { deletedAt: true },
    source: 'admin',
  })
  return { ok: true }
}

export async function getPaymentMethodsForCurrentUser() {
  const user = await requireCurrentUser()
  const methods = await prisma.customerPaymentMethod.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  })
  return methods.map((method) => ({
    id: method.id,
    provider: method.provider,
    type: method.type,
    brand: method.brand,
    last4: method.last4,
    expiryMonth: method.expiryMonth,
    expiryYear: method.expiryYear,
    walletPhoneMasked: method.walletPhoneMasked,
    isDefault: method.isDefault,
  }))
}
