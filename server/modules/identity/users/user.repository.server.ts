import type { Prisma } from '../../../prisma/generated/client.js'
import { prisma } from '../../db/prisma'
import type { UserStatus } from './types/user.constants.js'

export async function findUserByLogin(login: string) {
  const normalized = login.trim().toLowerCase()

  return prisma.user.findFirst({
    where: {
      OR: [{ login: normalized }, { email: normalized }],
    },
    include: {
      userProfile: true,
      userRoles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  })
}

export async function findUserByCode(userCode: string) {
  return prisma.user.findUnique({
    where: { code: userCode },
  })
}

export async function createUserRecord(data: {
  id: string
  login: string
  displayName: string
  email: string
  phone: string | null
  password: string
  status: string
  code: string
}) {
  return prisma.user.create({
    data: {
      id: data.id,
      login: data.login,
      displayName: data.displayName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      status: data.status,
      code: data.code,
      userProfile: {
        create: {
          id: crypto.randomUUID(),
          fullName: data.displayName,
          phone: data.phone,
        },
      },
    },
    include: { userProfile: true },
  })
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
    },
  })
}

export async function findUsersByIds(ids: string[]) {
  if (!ids.length) return []
  return prisma.user.findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true,
      userProfile: { select: { fullName: true, phone: true } },
    },
  })
}

export async function findUserByAccessToken(accessToken: string) {
  return prisma.session.findFirst({
    where: {
      accessToken,
      revokedAt: null,
      accessTokenExpires: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        include: {
          userProfile: true,
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function findUserByRefreshToken(refreshToken: string) {
  return prisma.session.findFirst({
    where: {
      refreshToken,
      revokedAt: null,
      refreshTokenExpires: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        include: {
          userProfile: true,
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function revokeUserSessions(userId: string) {
  await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}

export async function createSessionRecord(params: {
  sessionId: string
  accessToken: string
  userId: string
  accessTokenExpires: Date
  refreshToken: string
  refreshTokenExpires: Date
  deviceInfo?: Prisma.InputJsonValue
}) {
  return prisma.session.create({
    data: {
      id: params.sessionId,
      accessToken: params.accessToken,
      userId: params.userId,
      accessTokenExpires: params.accessTokenExpires,
      refreshToken: params.refreshToken,
      refreshTokenExpires: params.refreshTokenExpires,
      deviceInfo: params.deviceInfo,
    },
  })
}

export async function updateSessionAccessToken(params: {
  sessionId: string
  accessToken: string
  accessTokenExpires: Date
}) {
  return prisma.session.update({
    where: { id: params.sessionId },
    data: {
      accessToken: params.accessToken,
      accessTokenExpires: params.accessTokenExpires,
    },
  })
}
