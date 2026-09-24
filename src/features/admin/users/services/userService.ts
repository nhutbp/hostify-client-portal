import {
  bulkUpdateUserStatusFromAdmin,
  createUserFromAdmin,
  getAdminUserById,
  getAdminUserRoles,
  getAdminUsers,
  getAdminUsersStatistics,
  resetUserPasswordFromAdmin,
  revokeUserSessionsFromAdmin,
  updateUserStatusFromAdmin,
  updateUserProfileFromAdmin,
  updateUserRolesFromAdmin,
  getAdminRoleManagementData,
  createRoleFromAdmin,
  updateRoleFromAdmin,
  deleteRoleFromAdmin,
} from '../../../../../server/modules/users/users'
import type {
  BulkUpdateAdminUserStatusInput,
  CreateAdminUserInput,
  ListAdminUsersInput,
  UpdateAdminUserStatusInput,
  UpdateAdminUserProfileInput,
  UpdateAdminUserRolesInput,
} from '../../../../../server/modules/users/users.schemas'
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserStats,
  AssignableRole,
  AdminRoleManagement,
} from '../types'
import { unwrapSuccessResponse } from '@/utils/response'

type UsersResult = {
  items: AdminUser[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export const adminUserService = {
  list: (input: ListAdminUsersInput): Promise<UsersResult> =>
    getAdminUsers({ data: input }).then(
      unwrapSuccessResponse,
    ),
  stats: (): Promise<AdminUserStats> =>
    getAdminUsersStatistics().then(unwrapSuccessResponse),
  detail: (id: string): Promise<AdminUserDetail> =>
    getAdminUserById({ data: { id } }).then(unwrapSuccessResponse),
  roles: (): Promise<AssignableRole[]> =>
    getAdminUserRoles().then(unwrapSuccessResponse) as Promise<
      AssignableRole[]
    >,
  create: (input: CreateAdminUserInput) =>
    createUserFromAdmin({ data: input }).then(unwrapSuccessResponse),
  updateStatus: (input: UpdateAdminUserStatusInput) =>
    updateUserStatusFromAdmin({ data: input }).then(unwrapSuccessResponse),
  bulkUpdateStatus: (input: BulkUpdateAdminUserStatusInput) =>
    bulkUpdateUserStatusFromAdmin({ data: input }).then(unwrapSuccessResponse),
  updateProfile: (input: UpdateAdminUserProfileInput) =>
    updateUserProfileFromAdmin({ data: input }).then(unwrapSuccessResponse),
  updateRoles: (input: UpdateAdminUserRolesInput) =>
    updateUserRolesFromAdmin({ data: input }).then(unwrapSuccessResponse),
  resetPassword: (input: { id: string; password: string }) =>
    resetUserPasswordFromAdmin({ data: input }).then(unwrapSuccessResponse),
  revokeSessions: (input: { id: string; sessionId?: string }) =>
    revokeUserSessionsFromAdmin({ data: input }).then(unwrapSuccessResponse),
  roleManagement: (): Promise<AdminRoleManagement> =>
    getAdminRoleManagementData().then(
      unwrapSuccessResponse,
    ) as Promise<AdminRoleManagement>,
  createRole: (input: {
    name: string
    code: string
    description?: string
    canAccessDashboard: boolean
    permissionCodes: string[]
  }) => createRoleFromAdmin({ data: input }).then(unwrapSuccessResponse),
  updateRole: (input: {
    id: string
    name: string
    code: string
    description?: string
    canAccessDashboard: boolean
    permissionCodes: string[]
  }) => updateRoleFromAdmin({ data: input }).then(unwrapSuccessResponse),
  deleteRole: (id: string) =>
    deleteRoleFromAdmin({ data: { id } }).then(unwrapSuccessResponse),
}

export type { CreateAdminUserInput, ListAdminUsersInput }
