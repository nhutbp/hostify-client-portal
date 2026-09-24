import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListAdminUsersInput } from '../services/userService'
import { adminUserService } from '../services/userService'

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (input: ListAdminUsersInput) =>
    [...adminUserKeys.all, 'list', input] as const,
  stats: () => [...adminUserKeys.all, 'stats'] as const,
  detail: (id: string) => [...adminUserKeys.all, 'detail', id] as const,
  roles: () => [...adminUserKeys.all, 'roles'] as const,
  roleManagement: () => [...adminUserKeys.all, 'role-management'] as const,
}

export function useAdminUsers(input: ListAdminUsersInput) {
  return useQuery({
    queryKey: adminUserKeys.list(input),
    queryFn: () => adminUserService.list(input),
    placeholderData: (previous) => previous,
  })
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: adminUserKeys.stats(),
    queryFn: adminUserService.stats,
  })
}

export function useAdminUserDetail(id?: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(id ?? ''),
    queryFn: () => adminUserService.detail(id!),
    enabled: Boolean(id),
  })
}

export function useAdminAssignableRoles() {
  return useQuery({
    queryKey: adminUserKeys.roles(),
    queryFn: adminUserService.roles,
    staleTime: 60_000,
  })
}

export function useAdminRoleManagement() {
  return useQuery({
    queryKey: adminUserKeys.roleManagement(),
    queryFn: adminUserService.roleManagement,
  })
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminUserKeys.all })
  return {
    create: useMutation({
      mutationFn: adminUserService.create,
      onSuccess: invalidate,
    }),
    updateStatus: useMutation({
      mutationFn: adminUserService.updateStatus,
      onSuccess: invalidate,
    }),
    bulkUpdateStatus: useMutation({
      mutationFn: adminUserService.bulkUpdateStatus,
      onSuccess: invalidate,
    }),
    updateProfile: useMutation({
      mutationFn: adminUserService.updateProfile,
      onSuccess: invalidate,
    }),
    updateRoles: useMutation({
      mutationFn: adminUserService.updateRoles,
      onSuccess: invalidate,
    }),
    resetPassword: useMutation({
      mutationFn: adminUserService.resetPassword,
      onSuccess: invalidate,
    }),
    revokeSessions: useMutation({
      mutationFn: adminUserService.revokeSessions,
      onSuccess: invalidate,
    }),
    createRole: useMutation({
      mutationFn: adminUserService.createRole,
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: adminUserService.updateRole,
      onSuccess: invalidate,
    }),
    deleteRole: useMutation({
      mutationFn: adminUserService.deleteRole,
      onSuccess: invalidate,
    }),
  }
}
