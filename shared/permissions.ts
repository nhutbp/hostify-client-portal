import type { ModuleCode } from './module-catalog'

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'update',
  'delete',
  'approve',
] as const

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]

export const PERMISSION_MODULES = [
  {
    code: 'dashboard',
    name: 'Dashboard',
    resources: [
      { code: 'overview', name: 'Tổng quan hệ thống', actions: ['view'] },
    ],
  },
  {
    code: 'media',
    name: 'Media',
    resources: [
      {
        code: 'library',
        name: 'Thư viện media',
        actions: ['view', 'create', 'update', 'delete'],
      },
    ],
  },
  {
    code: 'post',
    name: 'Bài viết',
    resources: [
      {
        code: 'post',
        name: 'Danh sách bài viết',
        actions: ['view', 'create', 'update', 'delete', 'approve'],
      },
      {
        code: 'post_category',
        name: 'Danh mục bài viết',
        actions: ['view', 'create', 'update', 'delete'],
      },
      {
        code: 'post_platform',
        name: 'Nền tảng bài viết',
        actions: ['view', 'create', 'update', 'delete'],
      },
    ],
  },
  {
    code: 'appearance',
    name: 'Giao diện',
    resources: [
      {
        code: 'menu',
        name: 'Menu',
        actions: ['view', 'create', 'update', 'delete'],
      },
    ],
  },
  {
    code: 'user',
    name: 'Người dùng',
    resources: [
      {
        code: 'user',
        name: 'Danh sách người dùng',
        actions: ['view', 'create', 'update', 'delete', 'approve'],
      },
      {
        code: 'role',
        name: 'Vai trò và phân quyền',
        actions: ['view', 'create', 'update', 'delete'],
      },
    ],
  },
  {
    code: 'system',
    name: 'Hệ thống',
    resources: [
      {
        code: 'setting',
        name: 'Cài đặt hệ thống',
        actions: ['view', 'update'],
      },
      {
        code: 'audit_log',
        name: 'Nhật ký hoạt động',
        actions: ['view'],
      },
    ],
  },
] as const

export type PermissionModule = ModuleCode
export type PermissionActionCode<
  TModule extends PermissionModule = PermissionModule,
> = `${TModule}.${string}.${PermissionAction}`

const ACTION_NAMES: Record<PermissionAction, string> = {
  view: 'Xem',
  create: 'Tạo',
  update: 'Chỉnh sửa',
  delete: 'Xóa',
  approve: 'Phê duyệt',
}

export const PERMISSION_CATALOG = PERMISSION_MODULES.flatMap((module) =>
  module.resources.flatMap((resource) =>
    resource.actions.map((action) => ({
      code: `${module.code}.${resource.code}.${action}` as PermissionActionCode,
      module: module.code,
      moduleName: module.name,
      resource: resource.code,
      resourceName: resource.name,
      action,
      name: `${ACTION_NAMES[action]} ${resource.name}`,
      description: `${ACTION_NAMES[action]} ${resource.name.toLowerCase()}`,
    })),
  ),
)

const permissionCodes = new Set(PERMISSION_CATALOG.map(({ code }) => code))

export function isPermissionCode(value: string): value is PermissionActionCode {
  return permissionCodes.has(value as PermissionActionCode)
}
