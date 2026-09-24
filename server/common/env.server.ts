import { createAppError } from './app-error.server'
import { SYSTEM_ERROR_CODES } from './error-codes.server'

export function getEnv(name: string) {
  const value = process.env[name]
    ?.trim()
    .replace(/^['"]|['"]$/g, '')
  return value || undefined
}

export function getRequiredEnv(name: string) {
  const value = getEnv(name)
  if (!value) {
    throw createAppError({
      message: `Thiếu biến môi trường ${name}`,
      errorCode: SYSTEM_ERROR_CODES.CONFIGURATION,
      statusCode: 500,
    })
  }
  return value
}

export const env = {
  nodeEnv: getEnv('NODE_ENV') || 'development',
  isProduction: (getEnv('NODE_ENV') || 'development') === 'production',
  appUrl:
    getEnv('APP_URL') || getEnv('VITE_APP_URL') || 'http://localhost:3000',
  authResetTokenSecret: getRequiredEnv('AUTH_RESET_TOKEN_SECRET'),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  smtpHost: getRequiredEnv('SMTP_EMAIL_HOST'),
  smtpPort: Number(getRequiredEnv('SMTP_EMAIL_PORT')),
  smtpUser: getRequiredEnv('SMTP_EMAIL_USER'),
  smtpPassword: getRequiredEnv('SMTP_EMAIL_PASSWORD'),
  smtpFrom: getEnv('SMTP_EMAIL_FROM'),
}
