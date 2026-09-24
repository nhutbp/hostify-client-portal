import type { PermissionActionCode } from './permissions'
import type { ModuleCode, ModuleResource } from './module-catalog'

export const MODULE_CODES = {
  DASHBOARD: 'dashboard',
  MEDIA: 'media',
  POSTS: 'post',
  APPEARANCE: 'appearance',
  USERS: 'user',
  SYSTEM: 'system',
} as const satisfies Record<string, ModuleCode>

export function moduleResource<TModule extends ModuleCode>(
  module: TModule,
  resource: ModuleResource<TModule>,
) {
  return `${module}.${resource}`
}

export function permissionCode(
  module: ModuleCode,
  resource: string,
  action: 'view' | 'create' | 'update' | 'delete' | 'approve',
) {
  return `${module}.${resource}.${action}` as PermissionActionCode
}

export const PERMISSION_CODES = {
  DASHBOARD_OVERVIEW_VIEW: permissionCode(
    MODULE_CODES.DASHBOARD,
    'overview',
    'view',
  ),
  MEDIA_LIBRARY_VIEW: permissionCode(MODULE_CODES.MEDIA, 'library', 'view'),
  POST_VIEW: permissionCode(MODULE_CODES.POSTS, 'post', 'view'),
  POST_CATEGORY_VIEW: permissionCode(
    MODULE_CODES.POSTS,
    'post_category',
    'view',
  ),
  POST_PLATFORM_VIEW: permissionCode(
    MODULE_CODES.POSTS,
    'post_platform',
    'view',
  ),
  APPEARANCE_MENU_VIEW: permissionCode(MODULE_CODES.APPEARANCE, 'menu', 'view'),
  USER_VIEW: permissionCode(MODULE_CODES.USERS, 'user', 'view'),
  ROLE_VIEW: permissionCode(MODULE_CODES.USERS, 'role', 'view'),
  SYSTEM_SETTING_VIEW: permissionCode(MODULE_CODES.SYSTEM, 'setting', 'view'),
  SYSTEM_AUDIT_LOG_VIEW: permissionCode(
    MODULE_CODES.SYSTEM,
    'audit_log',
    'view',
  ),
} as const
