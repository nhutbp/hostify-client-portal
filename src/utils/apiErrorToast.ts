import { showErrorToast } from '@/components/common/ShowToast'

export interface ApiErrorPayload {
  success?: boolean
  statusCode?: number
  message?: string
  code?: string
  errorCode?: string
  error?: unknown
  timestamp?: string
  path?: string
}

export function parseApiError(err: unknown): ApiErrorPayload {
  const data = (err as any)?.response?.data ?? (err as any)?.data ?? err
  return {
    ...(data?.success !== undefined && { success: data.success }),
    ...(data?.statusCode !== undefined && { statusCode: data.statusCode }),
    ...(data?.message && { message: data.message }),
    ...(data?.code && { code: data.code }),
    ...(data?.errorCode && { errorCode: data.errorCode }),
    ...(data?.error !== undefined && { error: data.error }),
    ...(data?.timestamp && { timestamp: data.timestamp }),
    ...(data?.path && { path: data.path }),
  }
}

export function toastApiError(
  err: unknown,
  fallbackMessage = 'Có lỗi xảy ra. Vui lòng thử lại.',
) {
  const payload = parseApiError(err)
  const message = payload.message ?? fallbackMessage
  showErrorToast({ message })
  return message
}
