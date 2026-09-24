import lodash from 'lodash'

import type { ModuleCode, PermissionActionCode } from '@/types/permission'
import {
  MODULE_CODES,
  PERMISSION_CODES,
} from '../../../../../shared/permission-codes'

export type BadgeKey = 'pendingDispatch' | 'shipperTransfer'

export interface ChildItem {
  id: string
  titleKey: string
  icon?: string
  url: string
  moduleCode?: ModuleCode
  permission?: PermissionActionCode
  disabled?: boolean
  active?: boolean
  badge?: string
  badgeKey?: BadgeKey // For dynamic badges from stores
}

export interface MenuItem {
  id: string
  titleKey: string
  icon: string
  section?: string
  url?: string // Direct URL for items without children
  children?: ChildItem[]
  moduleCode?: ModuleCode
  permission?: PermissionActionCode
  disabled?: boolean
  active?: boolean
}

const { uniqueId } = lodash

const SidebarContent: MenuItem[] = [
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.dashboard',
    icon: 'solar:widget-2-linear',
    section: 'sidebar.sections.overview',
    url: '/dashboard',
    permission: PERMISSION_CODES.DASHBOARD_OVERVIEW_VIEW,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.vps',
    icon: 'solar:server-square-linear',
    section: 'sidebar.sections.products',
    children: [
      { id: uniqueId('menu-'), titleKey: 'sidebar.vpsPackages', icon: 'solar:layers-linear', url: '/dashboard/catalog/vps' },
      { id: uniqueId('menu-'), titleKey: 'sidebar.vpsServers', icon: 'solar:server-square-linear', url: '/dashboard/catalog/vps', active: false },
      { id: uniqueId('menu-'), titleKey: 'sidebar.vpsTemplates', icon: 'solar:widget-2-linear', url: '/dashboard/catalog/vps', active: false },
      { id: uniqueId('menu-'), titleKey: 'sidebar.vpsSettings', icon: 'solar:settings-linear', url: '/dashboard/catalog/vps', active: false },
    ],
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.hosting',
    icon: 'solar:server-2-linear',
    section: 'sidebar.sections.products',
    url: '/dashboard/catalog/vps',
    active: false,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.physicalServers',
    icon: 'solar:server-square-linear',
    section: 'sidebar.sections.products',
    url: '/dashboard/catalog/vps',
    active: false,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.proxy',
    icon: 'solar:global-linear',
    section: 'sidebar.sections.products',
    url: '/dashboard/catalog/vps',
    active: false,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.via',
    icon: 'solar:link-linear',
    section: 'sidebar.sections.products',
    url: '/dashboard/catalog/vps',
    active: false,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.otherServices',
    icon: 'solar:box-linear',
    section: 'sidebar.sections.products',
    url: '/dashboard/catalog/vps',
    active: false,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.media',
    icon: 'solar:gallery-linear',
    section: 'sidebar.sections.content',
    url: '/dashboard/media',
    permission: PERMISSION_CODES.MEDIA_LIBRARY_VIEW,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.posts',
    icon: 'solar:document-text-linear',
    section: 'sidebar.sections.content',
    children: [
      {
        id: uniqueId('menu-'),
        titleKey: 'sidebar.allPosts',
        icon: 'solar:record-circle-linear',
        url: '/dashboard/posts',
        permission: PERMISSION_CODES.POST_VIEW,
      },
      {
        id: uniqueId('menu-'),
        titleKey: 'sidebar.postCategories',
        icon: 'solar:record-circle-linear',
        url: '/dashboard/posts/categories',
        permission: PERMISSION_CODES.POST_CATEGORY_VIEW,
      },
      {
        id: uniqueId('menu-'),
        titleKey: 'sidebar.postPlatforms',
        icon: 'solar:record-circle-linear',
        url: '/dashboard/posts/platforms',
        permission: PERMISSION_CODES.POST_PLATFORM_VIEW,
      },
    ],
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.userManagement',
    icon: 'solar:users-group-rounded-linear',
    section: 'sidebar.sections.customers',
    children: [
      {
        id: uniqueId('menu-'),
        titleKey: 'sidebar.userList',
        icon: 'solar:user-list-linear',
        url: '/dashboard/users',
        permission: PERMISSION_CODES.USER_VIEW,
      },
      {
        id: uniqueId('menu-'),
        titleKey: 'sidebar.rolePermissions',
        icon: 'solar:shield-keyhole-linear',
        url: '/dashboard/users/roles',
        permission: PERMISSION_CODES.ROLE_VIEW,
      },
    ],
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.settings',
    icon: 'solar:settings-linear',
    section: 'sidebar.sections.system',
    url: '/dashboard/settings',
    moduleCode: MODULE_CODES.SYSTEM,
    permission: PERMISSION_CODES.SYSTEM_SETTING_VIEW,
  },
  {
    id: uniqueId('menu-'),
    titleKey: 'sidebar.auditLogs',
    icon: 'solar:history-linear',
    section: 'sidebar.sections.system',
    url: '/dashboard/audit-logs',
    moduleCode: MODULE_CODES.SYSTEM,
    permission: PERMISSION_CODES.SYSTEM_AUDIT_LOG_VIEW,
  },
]

export default SidebarContent
