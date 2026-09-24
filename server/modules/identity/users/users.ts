import { createServerFn } from '@tanstack/react-start'
import { createSuccessResponse } from '../../../common/response.server'
import {
  bulkUpdateAdminUserStatusSchema,
  createAdminUserSchema,
  adminUserDetailSchema,
  listAdminUsersSchema,
  resetAdminUserPasswordSchema,
  revokeAdminUserSessionsSchema,
  adminRoleDetailSchema,
  createAdminRoleSchema,
  updateAdminRoleSchema,
  updateAdminUserProfileSchema,
  updateAdminUserRolesSchema,
  updateAdminUserStatusSchema,
} from './users.schemas'

export const getAdminUsers = createServerFn({ method: 'GET' })
  .validator(listAdminUsersSchema)
  .handler(async ({ data }) => {
    const { listAdminUsers } = await import('./users.service.server')
    return createSuccessResponse(await listAdminUsers(data))
  })

export const getAdminUsersStatistics = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { getAdminUserStatistics } = await import('./users.service.server')
  return createSuccessResponse(await getAdminUserStatistics())
})

export const getAdminUserById = createServerFn({ method: 'GET' })
  .validator(adminUserDetailSchema)
  .handler(async ({ data }) => {
    const { getAdminUserDetail } = await import('./users.service.server')
    return createSuccessResponse(await getAdminUserDetail(data.id))
  })

export const getAdminUserRoles = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getAdminAssignableRoles } = await import('./users.service.server')
    return createSuccessResponse(await getAdminAssignableRoles())
  },
)

export const getAdminRoleManagementData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { getAdminRoleManagement } = await import('./users.service.server')
  return createSuccessResponse(await getAdminRoleManagement())
})

export const createRoleFromAdmin = createServerFn({ method: 'POST' })
  .validator(createAdminRoleSchema)
  .handler(async ({ data }) => {
    const { createAdminRole } = await import('./users.service.server')
    return createSuccessResponse(
      await createAdminRole(data),
      'Tạo vai trò thành công',
    )
  })

export const updateRoleFromAdmin = createServerFn({ method: 'POST' })
  .validator(updateAdminRoleSchema)
  .handler(async ({ data }) => {
    const { updateAdminRole } = await import('./users.service.server')
    return createSuccessResponse(
      await updateAdminRole(data),
      'Cập nhật vai trò thành công',
    )
  })

export const deleteRoleFromAdmin = createServerFn({ method: 'POST' })
  .validator(adminRoleDetailSchema)
  .handler(async ({ data }) => {
    const { deleteAdminRole } = await import('./users.service.server')
    return createSuccessResponse(
      await deleteAdminRole(data.id),
      'Xóa vai trò thành công',
    )
  })

export const updateUserProfileFromAdmin = createServerFn({ method: 'POST' })
  .validator(updateAdminUserProfileSchema)
  .handler(async ({ data }) => {
    const { updateAdminUserProfile } = await import('./users.service.server')
    return createSuccessResponse(
      await updateAdminUserProfile(data),
      'Cập nhật thông tin người dùng thành công',
    )
  })

export const updateUserRolesFromAdmin = createServerFn({ method: 'POST' })
  .validator(updateAdminUserRolesSchema)
  .handler(async ({ data }) => {
    const { updateAdminUserRoles } = await import('./users.service.server')
    return createSuccessResponse(
      await updateAdminUserRoles(data),
      'Cập nhật phân quyền thành công',
    )
  })

export const resetUserPasswordFromAdmin = createServerFn({ method: 'POST' })
  .validator(resetAdminUserPasswordSchema)
  .handler(async ({ data }) => {
    const { resetAdminUserPassword } = await import('./users.service.server')
    return createSuccessResponse(
      await resetAdminUserPassword(data),
      'Đặt lại mật khẩu thành công',
    )
  })

export const revokeUserSessionsFromAdmin = createServerFn({ method: 'POST' })
  .validator(revokeAdminUserSessionsSchema)
  .handler(async ({ data }) => {
    const { revokeAdminUserSessions } = await import('./users.service.server')
    return createSuccessResponse(
      await revokeAdminUserSessions(data),
      'Thu hồi phiên đăng nhập thành công',
    )
  })

export const createUserFromAdmin = createServerFn({ method: 'POST' })
  .validator(createAdminUserSchema)
  .handler(async ({ data }) => {
    const { createAdminUser } = await import('./users.service.server')
    return createSuccessResponse(
      await createAdminUser(data),
      'Thêm người dùng thành công',
    )
  })

export const updateUserStatusFromAdmin = createServerFn({ method: 'POST' })
  .validator(updateAdminUserStatusSchema)
  .handler(async ({ data }) => {
    const { updateAdminUserStatus } = await import('./users.service.server')
    return createSuccessResponse(
      await updateAdminUserStatus(data),
      'Cập nhật trạng thái thành công',
    )
  })

export const bulkUpdateUserStatusFromAdmin = createServerFn({ method: 'POST' })
  .validator(bulkUpdateAdminUserStatusSchema)
  .handler(async ({ data }) => {
    const { bulkUpdateAdminUserStatus } = await import('./users.service.server')
    return createSuccessResponse(
      await bulkUpdateAdminUserStatus(data),
      'Cập nhật người dùng thành công',
    )
  })
