import type { DashboardArea } from '../../FullLayout'
import SidebarContent, { type MenuItem } from './sidebaritem'
import customerSidebarItems from './customerSidebarItems'

export function getVisibleSidebarItems(
  area: DashboardArea,
  permissionCodes: readonly string[] = [],
  isSuperAdmin = false,
): MenuItem[] {
  if (area === 'customer') return customerSidebarItems
  if (isSuperAdmin) return SidebarContent

  const granted = new Set(permissionCodes)
  return SidebarContent.flatMap((item) => {
    if (item.permission && !granted.has(item.permission)) return []
    const children = item.children?.filter(
      (child) => !child.permission || granted.has(child.permission),
    )
    if (item.children && !children?.length) return []
    return [{ ...item, children }]
  })
}
