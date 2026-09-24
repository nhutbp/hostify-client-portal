import { getRequestHeader } from '@tanstack/react-start/server'
import { v7 as uuidv7 } from 'uuid'
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  verifyPassword,
  verifyPasswordResetToken,
} from './shared/password.server'
import {
  clearAuthCookies,
  createSessionToken,
  getSessionCookieName,
  getRefreshCookieName,
  hashSessionToken,
  readCookieValue,
  setAuthCookies,
  setSessionCookie,
} from '../../common/cookies.server'
import {
  createUserRecord,
  createSessionRecord,
  findUserByEmail,
  findUserByLogin,
  findUserByCode,
  findUserByAccessToken,
  findUserByRefreshToken,
  updateSessionAccessToken,
  updateUserStatus,
} from '../users/user.repository.server'
import {
  USER_STATUSES,
  normalizeUserStatus,
} from '../users/types/user.constants'
import {
  buildPasswordResetLink,
  sendPasswordResetEmail,
} from './email/password-reset-email.server'
import {
  buildVerificationLink,
  sendVerificationLinkEmail,
} from './email/verification-email.server'
import { prisma } from '../../db/prisma'
import { createAppError } from '../../common/app-error.server'
import {
  createMessageResponse,
  createSuccessResponse,
} from '../../common/response.server'
import { normalizePhoneForVN } from '../../../src/utils/phone'
import { AUTH_ERROR_CODES } from './auth.errors'
import { ROLE_CODES } from '../../../shared/roles'
import type {
  AuthUser,
  ForgotPasswordCredentials,
  LoginCredentials,
  RegisterCredentials,
  ResendVerificationEmailCredentials,
  ResetPasswordCredentials,
} from './auth.types'

const DEFAULT_ROLE: AuthUser['role'] = {
  id: 'user',
  roleName: 'user',
  roleDisplayName: 'User',
}

function toSafeUser(user: {
  id: string
  login: string
  displayName: string
  email: string
  status: string
  phone: string | null
  code: string
  createdAt: Date
  updatedAt: Date
  userProfile?: { avatarUrl: string | null; phone?: string | null } | null
  userRoles?: Array<{
    role: {
      code: string
      name: string
      canAccessDashboard: boolean
      permissions: Array<{
        permission: { code: string }
      }>
    }
  }>
}): AuthUser {
  const isVerified = normalizeUserStatus(user.status) === USER_STATUSES.ACTIVE
  const roles = user.userRoles?.map(({ role }) => role) ?? []
  const primaryRole = roles.at(0)
  const roleCodes = roles.map(({ code }) => code)
  const isSuperAdmin = roleCodes.includes(ROLE_CODES.SUPER_ADMIN)

  return {
    id: user.id,
    userLogin: user.login,
    displayName: user.displayName,
    userEmail: user.email,
    userStatus: user.status,
    userPhone: user.userProfile?.phone ?? user.phone,
    userCode: user.code,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    avatarUrl: user.userProfile?.avatarUrl ?? null,
    userRegistered: user.createdAt.toISOString(),
    isVerified,
    userRole: primaryRole?.name ?? DEFAULT_ROLE.roleDisplayName,
    role: primaryRole
      ? {
          id: primaryRole.code,
          roleName: primaryRole.code,
          roleDisplayName: primaryRole.name,
        }
      : DEFAULT_ROLE,
    roleCodes,
    permissionCodes: [
      ...new Set(
        roles.flatMap(({ permissions }) =>
          permissions.map(({ permission }) => permission.code),
        ),
      ),
    ],
    isSuperAdmin,
    canAccessDashboard:
      isSuperAdmin ||
      roles.some(
        ({ canAccessDashboard, permissions }) =>
          canAccessDashboard && permissions.length > 0,
      ),
  }
}

async function createUserSession(userId: string) {
  const sessionToken = createSessionToken()
  const refreshToken = createSessionToken()
  const accessTokenExpires = new Date(Date.now() + 1000 * 60 * 15)
  const refreshTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  const accessToken = hashSessionToken(sessionToken)
  const deviceInfo = getDeviceInfoFromRequest()

  await createSessionRecord({
    sessionId: uuidv7(),
    accessToken,
    userId,
    accessTokenExpires,
    refreshToken,
    refreshTokenExpires,
    deviceInfo,
  })
  setAuthCookies(sessionToken, refreshToken)
}

function getClientIp() {
  const forwardedFor = getRequestHeader('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || ''
  }

  return getRequestHeader('x-real-ip')?.trim() || ''
}

function getDeviceInfoFromRequest() {
  const userAgent = getRequestHeader('user-agent') || ''
  const ip = getClientIp()

  const browser =
    userAgent.match(/(Chrome\/[\d.]+)/)?.[1] ||
    userAgent.match(/(Firefox\/[\d.]+)/)?.[1] ||
    userAgent.match(/(Edg\/[\d.]+)/)?.[1] ||
    userAgent.match(/(Safari\/[\d.]+)/)?.[1] ||
    'Unknown'

  const os =
    (userAgent.match(/Mac OS X ([\d_]+)/)?.[1]
      ? `macOS ${userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replaceAll('_', '.')}`
      : userAgent.includes('Windows NT')
        ? 'Windows'
        : userAgent.includes('Linux')
          ? 'Linux'
          : 'Unknown') || 'Unknown'

  const isMobile = /Mobile|iPhone|Android/.test(userAgent)
  const device = isMobile ? 'mobile' : 'desktop'
  const deviceModel = userAgent.includes('Macintosh')
    ? 'Macintosh'
    : userAgent.includes('iPhone')
      ? 'iPhone'
      : userAgent.includes('iPad')
        ? 'iPad'
        : userAgent.includes('Windows')
          ? 'PC'
          : device
  const deviceVendor =
    userAgent.includes('Macintosh') ||
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad')
      ? 'Apple'
      : userAgent.includes('Windows')
        ? 'Microsoft'
        : userAgent.includes('Android')
          ? 'Google'
          : ''

  return {
    ip,
    browser,
    os,
    device,
    deviceModel,
    deviceVendor,
  }
}

async function refreshAccessSession(session: { id: string }) {
  const newAccessToken = createSessionToken()
  const newAccessTokenHash = hashSessionToken(newAccessToken)
  const newAccessTokenExpires = new Date(Date.now() + 1000 * 60 * 15)

  await updateSessionAccessToken({
    sessionId: session.id,
    accessToken: newAccessTokenHash,
    accessTokenExpires: newAccessTokenExpires,
  })

  setSessionCookie(newAccessToken)
}

async function issueVerificationLink(user: {
  id: string
  email: string
  createdAt: Date
}) {
  const link = buildVerificationLink({
    userId: user.id,
    createdAt: user.createdAt.toISOString(),
    email: user.email,
  })

  await sendVerificationLinkEmail({
    email: user.email,
    link,
  })
}

async function issuePasswordResetLink(user: { id: string; email: string }) {
  const link = buildPasswordResetLink({
    userId: user.id,
    email: user.email,
  })

  await sendPasswordResetEmail({
    email: user.email,
    link,
  })
}

async function generateUniqueUserCode(userLogin: string) {
  const normalizedBase =
    userLogin
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'USER'

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = uuidv7().replace(/-/g, '').slice(0, 8).toUpperCase()
    const userCode = `${normalizedBase}-${suffix}`
    const existing = await findUserByCode(userCode)
    if (!existing) return userCode
  }

  return `USER-${uuidv7().replace(/-/g, '').slice(0, 12).toUpperCase()}`
}

export async function loginWithCredentials(credentials: LoginCredentials) {
  const user = await findUserByLogin(credentials.login)
  const hashToVerify = user?.password ?? DUMMY_PASSWORD_HASH
  const passwordMatches = await verifyPassword(
    hashToVerify,
    credentials.password,
  )

  if (!user || !passwordMatches) {
    throw createAppError({
      message: 'Email/username hoặc mật khẩu không đúng',
      errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      statusCode: 401,
    })
  }

  if (normalizeUserStatus(user.status) !== USER_STATUSES.ACTIVE) {
    throw createAppError({
      message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email',
      errorCode: AUTH_ERROR_CODES.ACCOUNT_UNVERIFIED,
      statusCode: 403,
    })
  }

  await createUserSession(user.id)
  return createSuccessResponse(toSafeUser(user))
}

export async function registerWithCredentials(
  credentials: RegisterCredentials,
) {
  const normalizedLogin = credentials.userLogin.trim().toLowerCase()
  const normalizedEmail = credentials.userEmail.trim().toLowerCase()
  const normalizedDisplayName = credentials.displayName.trim()
  const normalizedPhone = normalizePhoneForVN(credentials.userPhone.trim())

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ login: normalizedLogin }, { email: normalizedEmail }],
    },
  })

  if (existingUser) {
    throw createAppError({
      message: 'Tài khoản với tên đăng nhập hoặc email này đã tồn tại',
      errorCode: AUTH_ERROR_CODES.USER_ALREADY_EXISTS,
      statusCode: 409,
    })
  }

  const userCode = await generateUniqueUserCode(normalizedLogin)
  const userPass = await hashPassword(credentials.userPass)
  const user = await createUserRecord({
    id: uuidv7(),
    login: normalizedLogin,
    displayName: normalizedDisplayName,
    email: normalizedEmail,
    phone: normalizedPhone,
    password: userPass,
    status: USER_STATUSES.UNVERIFY,
    code: userCode,
  })

  void issueVerificationLink(user).catch((error) => {
    console.error('[email:verification-link] failed after register', {
      userId: user.id,
      email: user.email,
      error,
    })
  })
  return createSuccessResponse(toSafeUser(user), 'Đăng ký thành công')
}

export async function resendVerificationEmail(
  credentials: ResendVerificationEmailCredentials,
) {
  const email = credentials.email.trim().toLowerCase()
  const user = await findUserByEmail(email)

  if (!user) {
    throw createAppError({
      message: 'Không tìm thấy tài khoản với email này',
      errorCode: AUTH_ERROR_CODES.EMAIL_NOT_FOUND,
      statusCode: 404,
    })
  }

  if (normalizeUserStatus(user.status) === USER_STATUSES.ACTIVE) {
    return createMessageResponse('Tài khoản đã được kích hoạt')
  }

  await issueVerificationLink(user)
  return createMessageResponse('Đã gửi lại email xác thực')
}

export async function forgotPasswordWithCredentials(
  credentials: ForgotPasswordCredentials,
) {
  const email = credentials.email.trim().toLowerCase()
  const user = await findUserByEmail(email)

  if (user) {
    void issuePasswordResetLink(user).catch((error) => {
      console.error(
        '[email:password-reset-link] failed after forgot password',
        {
          userId: user.id,
          email: user.email,
          error,
        },
      )
    })
  }

  return createMessageResponse(
    'Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
  )
}

export async function resetPasswordWithCredentials(
  credentials: ResetPasswordCredentials,
) {
  const tokenRecord = verifyPasswordResetToken(credentials.token.trim())
  const user = await prisma.user.findUnique({
    where: { id: tokenRecord.userId },
  })

  if (!user) {
    throw createAppError({
      message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID,
      statusCode: 400,
    })
  }

  if (
    user.email.trim().toLowerCase() !== tokenRecord.email.trim().toLowerCase()
  ) {
    throw createAppError({
      message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID,
      statusCode: 400,
    })
  }

  const hashedPassword = await hashPassword(credentials.password)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await tx.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })
  })

  return createMessageResponse('Đặt lại mật khẩu thành công')
}

export async function verifyEmailLink(credentials: {
  userId: string
  createdAt: string
  email?: string
}) {
  const user = await prisma.user.findUnique({
    where: { id: credentials.userId.trim() },
  })

  if (!user) {
    throw createAppError({
      message: 'Không tìm thấy tài khoản với liên kết này',
      errorCode: AUTH_ERROR_CODES.VERIFICATION_USER_NOT_FOUND,
      statusCode: 404,
    })
  }

  if (user.createdAt.toISOString() !== credentials.createdAt.trim()) {
    throw createAppError({
      message: 'Liên kết xác thực không hợp lệ',
      errorCode: AUTH_ERROR_CODES.VERIFICATION_LINK_INVALID,
      statusCode: 400,
    })
  }

  if (normalizeUserStatus(user.status) !== USER_STATUSES.ACTIVE) {
    await updateUserStatus(user.id, USER_STATUSES.ACTIVE)
  }

  await createUserSession(user.id)
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
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

  return createSuccessResponse(toSafeUser(updatedUser ?? user))
}

export async function getCurrentUserFromRequest() {
  const cookieValue = readCookieValue(getSessionCookieName())
  if (cookieValue) {
    const accessToken = hashSessionToken(cookieValue)
    const session = await findUserByAccessToken(accessToken)
    if (session) {
      return createSuccessResponse(toSafeUser(session.user))
    }
  }

  const refreshCookieValue = readCookieValue(getRefreshCookieName())
  if (!refreshCookieValue) {
    clearAuthCookies()
    return createSuccessResponse(null)
  }

  const session = await findUserByRefreshToken(refreshCookieValue)
  if (!session) {
    clearAuthCookies()
    return createSuccessResponse(null)
  }

  await refreshAccessSession({
    id: session.id,
  })

  return createSuccessResponse(toSafeUser(session.user))
}

export async function logoutCurrentSession() {
  const cookieValue = readCookieValue(getSessionCookieName())
  const refreshCookieValue = readCookieValue(getRefreshCookieName())
  let revoked = false

  if (cookieValue) {
    const accessToken = hashSessionToken(cookieValue)
    const result = await prisma.session.updateMany({
      where: {
        accessToken,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })
    revoked = result.count > 0
  }

  if (!revoked && refreshCookieValue) {
    await prisma.session.updateMany({
      where: {
        refreshToken: refreshCookieValue,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })
  }

  clearAuthCookies()
  return createMessageResponse('Đăng xuất thành công')
}
