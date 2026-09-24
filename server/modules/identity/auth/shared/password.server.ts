import { createHmac, timingSafeEqual } from 'node:crypto'
import argon2 from 'argon2'
import { env } from '../../../../common/env.server'
import { createAppError } from '../../../../common/app-error.server'
import { AUTH_ERROR_CODES } from '../auth.errors'

export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$O1NJQIqYwEXbmo8GOHzn6w$8aiVJJkszVGXn4zRQbJ9ytLQUD57+HzuMxMXroKdbVA'

type PasswordResetTokenPayload = {
  userId: string
  email: string
  iat: number
  exp: number
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlEncodeJson(value: unknown) {
  return base64UrlEncode(JSON.stringify(value))
}

function base64UrlDecodeJson<T>(value: string) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T
}

function getSecret() {
  return env.authResetTokenSecret
}

function sign(input: string) {
  return createHmac('sha256', getSecret()).update(input).digest('base64url')
}

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id })
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password)
}

export function createPasswordResetToken(payload: {
  userId: string
  email: string
  expiresInSeconds?: number
}) {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + (payload.expiresInSeconds ?? 60 * 60)
  const header = { alg: 'HS256', typ: 'JWT' }
  const body: PasswordResetTokenPayload = {
    userId: payload.userId,
    email: payload.email.toLowerCase(),
    iat,
    exp,
  }
  const encodedHeader = base64UrlEncodeJson(header)
  const encodedBody = base64UrlEncodeJson(body)
  const signature = sign(`${encodedHeader}.${encodedBody}`)

  return `${encodedHeader}.${encodedBody}.${signature}`
}

export function verifyPasswordResetToken(token: string) {
  const [encodedHeader, encodedBody, signature] = token.split('.')

  if (!encodedHeader || !encodedBody || !signature) {
    throw createAppError({
      message: 'Token đặt lại mật khẩu không hợp lệ',
      errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID,
      statusCode: 400,
    })
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedBody}`)
  const received = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    throw createAppError({
      message: 'Token đặt lại mật khẩu không hợp lệ',
      errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID,
      statusCode: 400,
    })
  }

  const header = base64UrlDecodeJson<{ alg?: string; typ?: string }>(
    encodedHeader,
  )
  if (header.alg !== 'HS256') {
    throw createAppError({
      message: 'Token đặt lại mật khẩu không hợp lệ',
      errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID,
      statusCode: 400,
    })
  }

  const payload = base64UrlDecodeJson<PasswordResetTokenPayload>(encodedBody)
  const now = Math.floor(Date.now() / 1000)

  if (!payload.userId || !payload.email || !payload.exp || payload.exp <= now) {
    throw createAppError({
      message: 'Token đặt lại mật khẩu đã hết hạn',
      errorCode: AUTH_ERROR_CODES.RESET_TOKEN_INVALID,
      statusCode: 400,
    })
  }

  return payload
}
