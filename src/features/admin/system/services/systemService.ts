// System service - API communication layer
import type {
  SystemOption,
  SystemOptionsResponse,
  SystemOptionsFilters,
  CreateOptionRequest,
  UpdateOptionRequest,
  ApiSuccessResponse,
} from '../types/system'
import { api } from '@/config/api'

export const systemService = {
  /**
   * Get paginated list of system options
   * GET /admin/system/options
   */
  getOptions: async (
    filters: SystemOptionsFilters,
  ): Promise<SystemOptionsResponse> => {
    const { data } = await api.get('/admin/system/options', { params: filters })
    return data
  },

  /**
   * Get option by key
   * GET /admin/system/options/:key
   */
  getOption: async (key: string): Promise<SystemOption> => {
    const { data } = await api.get(`/admin/system/options/${key}`)
    return data
  },

  /**
   * Create a new option
   * POST /admin/system/options
   */
  createOption: async (
    request: CreateOptionRequest,
  ): Promise<ApiSuccessResponse> => {
    const { data } = await api.post('/admin/system/options', request)
    return data
  },

  /**
   * Update an existing option
   * PUT /admin/system/options/:key
   */
  updateOption: async (
    key: string,
    request: UpdateOptionRequest,
  ): Promise<ApiSuccessResponse> => {
    const { data } = await api.put(`/admin/system/options/${key}`, request)
    return data
  },

  /**
   * Delete an option
   * DELETE /admin/system/options/:key
   */
  deleteOption: async (key: string): Promise<ApiSuccessResponse> => {
    const { data } = await api.delete(`/admin/system/options/${key}`)
    return data
  },
}
