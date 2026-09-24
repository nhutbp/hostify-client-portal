import { getRequest } from '@tanstack/react-start/server'

const DEFAULT_SUCCESS_MESSAGE = 'Operation completed successfully'

function getRequestPath() {
  const request = getRequest()
  const url = new URL(request.url)
  return `${url.pathname}${url.search}`
}

function getTimestamp() {
  return new Date().toISOString()
}

export type SuccessResponse<T> = {
  success: true
  message: string
  result: T
  timestamp: string
  path: string
}

export type ArraySuccessResponse<T> = SuccessResponse<T[]>

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

export function createSuccessResponse<T>(
  result: T,
  message: string = DEFAULT_SUCCESS_MESSAGE,
): SuccessResponse<T> {
  return {
    success: true,
    message,
    result,
    timestamp: getTimestamp(),
    path: getRequestPath(),
  }
}

export function createMessageResponse(message: string) {
  return createSuccessResponse({ message }, message)
}

export function createArrayResponse<T>(
  data: T[],
  message: string = DEFAULT_SUCCESS_MESSAGE,
): ArraySuccessResponse<T> {
  return createSuccessResponse(data, message)
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message: string = DEFAULT_SUCCESS_MESSAGE,
): PaginatedSuccessResponse<T> {
  const totalPages = Math.ceil(total / limit)
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return createSuccessResponse(
    {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasPrevious,
        hasNext,
      },
    },
    message,
  )
}
