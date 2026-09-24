export type SuccessResponse<T> = {
  success: true
  message: string
  result: T
  timestamp: string
  path: string
}

export type PaginatedSuccessResponse<T> = SuccessResponse<{
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
}>

type SuccessEnvelope<T> = SuccessResponse<T> | T

export function unwrapSuccessResponse<T>(response: SuccessEnvelope<T>): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    (response as { success?: boolean }).success === true &&
    'result' in response
  ) {
    return response.result
  }

  return response as T
}
