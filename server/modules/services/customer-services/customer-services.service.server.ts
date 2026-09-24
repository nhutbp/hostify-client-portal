import { createAppError } from '../../../common/app-error.server'
import { requireAuthContext } from '../../../common/auth-context.server'
import {
  countMyCustomerServices,
  findMyCustomerServiceRecord,
  listMyCustomerServiceRecords,
} from './customer-services.repository.server'
import type { ListMyCustomerServicesInput } from './customer-services.schemas'

export async function listMyCustomerServices(
  input: ListMyCustomerServicesInput,
) {
  const { user } = await requireAuthContext()
  const [items, total] = await Promise.all([
    listMyCustomerServiceRecords(user.id, input),
    countMyCustomerServices(user.id, input),
  ])
  const totalPages = Math.ceil(total / input.limit)

  return {
    items,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages,
      hasPrevious: input.page > 1,
      hasNext: input.page < totalPages,
    },
  }
}

export async function getMyCustomerService(id: string) {
  const { user } = await requireAuthContext()
  const service = await findMyCustomerServiceRecord(user.id, id)
  if (!service) {
    throw createAppError({
      message: 'Không tìm thấy dịch vụ hoặc bạn không có quyền truy cập',
      errorCode: 'SERVICE_NOT_FOUND',
      statusCode: 404,
    })
  }
  return service
}
