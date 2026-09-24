// System Options types based on Admin API specification

/**
 * System Option entity
 * GET /admin/system/options/:key
 */
export interface SystemOption {
  id: string // Option ID (UUID v7)
  optionKey: string // Unique option key
  optionValue: Record<string, unknown> // Option value as JSON object
  autoload: boolean // Whether option is auto-loaded
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

/**
 * Pagination meta for list responses
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

/**
 * System Options list response
 * GET /admin/system/options
 */
export interface SystemOptionsResponse {
  items: SystemOption[]
  meta: PaginationMeta
}

/**
 * Filters for system options list
 */
export interface SystemOptionsFilters {
  search?: string // Search by option key (partial match)
  autoload?: boolean // Filter by autoload status
  page?: number // Page number (default: 1)
  limit?: number // Items per page (default: 10, max: 100)
}

/**
 * Create option request
 * POST /admin/system/options
 */
export interface CreateOptionRequest {
  optionKey: string // Required - Unique option key (max 191 chars)
  optionValue: Record<string, unknown> // Required - Option value as JSON object
  autoload?: boolean // Optional - Auto-load on startup (default: false)
}

/**
 * Update option request
 * PUT /admin/system/options/:key
 */
export interface UpdateOptionRequest {
  optionValue?: Record<string, unknown> // Optional - New option value
  autoload?: boolean // Optional - Update autoload status
}

/**
 * API success response
 */
export interface ApiSuccessResponse {
  success: boolean
  message: string
}
