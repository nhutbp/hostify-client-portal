import { createAppError } from '../../../common/app-error.server'
import { ROLE_CODES } from '../../../../shared/roles'
import { getCurrentUserFromRequest } from './auth.service.server'

export async function requireCustomer() {
  const user = (await getCurrentUserFromRequest()).result
  if (!user) {
    throw createAppError({
      message: 'Vui lòng đăng nhập',
      errorCode: 'CUSTOMER_AUTH_REQUIRED',
      statusCode: 401,
    })
  }
  if (!user.roleCodes.includes(ROLE_CODES.CUSTOMER)) {
    throw createAppError({
      message: 'Không có quyền truy cập',
      errorCode: 'CUSTOMER_ACCESS_DENIED',
      statusCode: 403,
    })
  }
  return user
}
