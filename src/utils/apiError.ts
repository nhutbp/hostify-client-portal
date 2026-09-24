import i18n from '@/config/i18n'
import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  success?: boolean
  statusCode?: number
  code?: string
  errorCode?: string
  error?: unknown
  message?: string
  errors?: Array<{
    field: string
    message: string
    errorCode: string
  }>
}

type UnknownErrorLike = {
  code?: unknown
  errorCode?: unknown
  message?: unknown
  data?: ApiErrorResponse
  error?: unknown
  response?: { data?: ApiErrorResponse }
}

// Map error code prefix to i18n namespace
const ERROR_CODE_PREFIXES: Record<string, string> = {
  AUTH: 'apiErrors:auth',
  ACCOUNT: 'apiErrors:account',
  APPEARANCE: 'apiErrors:appearance',
  MEDIA: 'apiErrors:media',
  POST: 'apiErrors:post',
  SYSTEM: 'apiErrors:system',
  S3: 'apiErrors:s3',
  API_KEY: 'apiErrors:apiKey',
  USER_ROLE: 'apiErrors:userRole',
  USER: 'apiErrors:user',
}

// System error codes
const SYSTEM_ERROR_CODES = [
  'UNKNOWN_ERROR',
  'VALIDATION_ERROR',
  'QUERY_FAILED_ERROR',
]

/**
 * Get i18n key for an error code
 */
function getErrorI18nKey(errorCode: string): string | null {
  if (!errorCode) return null

  // Check system errors first
  if (SYSTEM_ERROR_CODES.includes(errorCode)) {
    return `apiErrors:system.${errorCode}`
  }

  // Find matching prefix
  for (const [prefix, namespace] of Object.entries(ERROR_CODE_PREFIXES)) {
    if (errorCode.startsWith(prefix)) {
      return `${namespace}.${errorCode}`
    }
  }

  return null
}

function readErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null

  const value = error as UnknownErrorLike

  const directCode = typeof value.code === 'string' ? value.code : null
  if (directCode) return directCode

  const directErrorCode =
    typeof value.errorCode === 'string' ? value.errorCode : null
  if (directErrorCode) return directErrorCode

  const responseCode = value.response?.data?.code
  if (typeof responseCode === 'string') return responseCode

  const responseErrorCode = value.response?.data?.errorCode
  if (typeof responseErrorCode === 'string') return responseErrorCode

  const dataErrorCode = value.data?.errorCode ?? value.data?.code
  if (typeof dataErrorCode === 'string') return dataErrorCode

  const nestedErrorCode =
    typeof value.error === 'object' && value.error && 'errorCode' in value.error
      ? (value.error as { errorCode?: unknown }).errorCode
      : null
  if (typeof nestedErrorCode === 'string') return nestedErrorCode

  return null
}

/**
 * Get translated error message from error code
 */
export function getErrorMessageByCode(
  errorCode: string,
  fallback?: string,
): string {
  const i18nKey = getErrorI18nKey(errorCode)

  if (i18nKey && i18n.exists(i18nKey)) {
    return i18n.t(i18nKey)
  }

  return fallback ?? errorCode
}

/**
 * Get API error message with i18n support
 * Priority: i18n translation > API message > fallback
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage?: string,
): string {
  if (!error) return fallbackMessage ?? i18n.t('errors.unknown')

  const axiosError = error as AxiosError<ApiErrorResponse>
  const errorData =
    axiosError.response?.data ??
    (error as UnknownErrorLike).data ??
    ((error as UnknownErrorLike).error as ApiErrorResponse | undefined)
  const errorCode =
    readErrorCode(error) ?? errorData?.errorCode ?? errorData?.code

  // Try to get translated message from error code
  if (errorCode) {
    const translatedMessage = getErrorMessageByCode(errorCode)
    if (translatedMessage !== errorCode) {
      return translatedMessage
    }
  }

  // Fallback to API message
  if (errorData?.message) {
    return errorData.message
  }

  const directMessage = (error as UnknownErrorLike).message
  if (typeof directMessage === 'string') {
    return directMessage
  }

  if (typeof (error as any)?.message === 'string') {
    return (error as any).message
  }

  if (axiosError.message) {
    return axiosError.message
  }

  return fallbackMessage ?? i18n.t('errors.unknown')
}

/**
 * Get error code from API error
 */
export function getApiErrorCode(error: unknown): string | null {
  const axiosError = error as AxiosError<ApiErrorResponse>
  const directData = (error as UnknownErrorLike).data
  return (
    readErrorCode(error) ??
    axiosError.response?.data.errorCode ??
    axiosError.response?.data.code ??
    directData?.errorCode ??
    directData?.code ??
    null
  )
}

export function getApiFieldErrors(
  error: unknown,
): Record<string, string> | null {
  const axiosError = error as AxiosError<ApiErrorResponse>

  if (!axiosError.response?.data.errors) return null

  const fieldErrors: Record<string, string> = {}
  axiosError.response.data.errors.forEach((err) => {
    // Try to translate field error
    const translatedMessage = getErrorMessageByCode(err.errorCode, err.message)
    fieldErrors[err.field] = translatedMessage
  })

  return fieldErrors
}
