import {
  getMyCustomerService,
  getMyCustomerServices,
} from '../../../../../server/modules/services/customer-services/customer-services'
import { unwrapSuccessResponse } from '@/utils/response'

export type CustomerServicesFilters = {
  category?: string
  providerId?: string
  status?:
    | 'PENDING'
    | 'PROVISIONING'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'EXPIRED'
    | 'TERMINATED'
    | 'ERROR'
  search?: string
  sort: 'NEWEST' | 'OLDEST' | 'EXPIRING'
  page: number
  limit: number
}

export const customerServicesService = {
  list: async (filters: CustomerServicesFilters) =>
    unwrapSuccessResponse(await getMyCustomerServices({ data: filters })),
  detail: async (id: string) =>
    unwrapSuccessResponse(await getMyCustomerService({ data: { id } })),
}
