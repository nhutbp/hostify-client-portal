import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from '@tanstack/react-router'
import FullLogo from '@/layouts/full/shared/logo/FullLogo'
import Logo from '@/layouts/full/shared/logo/Logo'
import SidebarContent from '@/layouts/full/vertical/sidebar/sidebaritem'
import type { MenuItem } from '@/layouts/full/vertical/sidebar/sidebaritem'
import { cn } from '@/utils/utils'
import { Icon } from '@iconify/react'
import SimpleBar from 'simplebar-react'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/features/auth/store/authStore'

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

// Collapsible Menu Item Component
const CollapsibleMenuItem = ({
  item,
  isExpanded,
  onToggle,
  currentPath,
  onClose,
  t,
  badgeCounts,
  isCollapsed,
}: {
  item: MenuItem
  isExpanded: boolean
  onToggle: () => void
  currentPath: string
  onClose?: () => void
  t: (key: string) => string
  badgeCounts: Record<string, number>
  isCollapsed: boolean
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.active !== false && item.url === currentPath
  const hasActiveChild = item.children?.some(
    (child) => child.active !== false && child.url === currentPath,
  )

  // Calculate total badge count for parent menu
  const totalBadgeCount =
    item.children?.reduce((sum, child) => {
      if (child.badgeKey && badgeCounts[child.badgeKey] > 0) {
        return sum + badgeCounts[child.badgeKey]
      }
      return sum
    }, 0) ?? 0

  // For items without children - direct link
  if (!hasChildren && item.url) {
    return (
      <Link
        to={item.url}
        onClick={onClose}
        className={cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          'hover:bg-primary/10 hover:text-primary',
          isActive
            ? 'bg-primary/10 text-primary before:absolute before:left-0 before:h-7 before:w-1 before:rounded-r-full before:bg-primary'
            : 'text-sidebar-foreground',
          isCollapsed && 'justify-center px-2',
        )}
      >
        <Icon icon={item.icon} className="size-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{t(item.titleKey)}</span>}
      </Link>
    )
  }

  // For items with children - collapsible
  return (
    <div className="space-y-1">
      {/* Parent Menu Button */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'text-md flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium transition-colors',
          'hover:bg-primary/10 hover:text-primary',
          hasActiveChild
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground',
          isCollapsed && 'justify-center px-2',
        )}
        aria-label={t(item.titleKey)}
      >
        <div className="flex items-center gap-3">
          <Icon icon={item.icon} className="size-5 shrink-0" />
          {!isCollapsed && <span className="truncate">{t(item.titleKey)}</span>}
          {!isCollapsed && !isExpanded && totalBadgeCount > 0 && (
            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {totalBadgeCount}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <Icon
            icon="solar:alt-arrow-down-linear"
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        )}
      </button>

      {/* Children Menu Items */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-border ml-4 space-y-1 border-l pl-4">
          {item.children?.map((child) => {
            const isChildActive = child.active !== false && child.url === currentPath
            return (
              <Link
                key={child.id}
                to={child.url}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  'hover:bg-primary/10 hover:text-primary',
                  isChildActive
                    ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:h-7 before:w-1 before:rounded-r-full before:bg-primary'
                    : 'text-sidebar-foreground/80',
                  isCollapsed && 'justify-center px-2',
                )}
              >
                <Icon
                  icon="solar:record-circle-linear"
                  className="size-2 shrink-0"
                />
                {!isCollapsed && (
                  <span className="truncate">{t(child.titleKey)}</span>
                )}
                {/* Dynamic badge from store */}
                {/* Static badge */}
                {!isCollapsed && child.badge && !child.badgeKey && (
                  <span className="bg-primary/20 text-primary ml-auto rounded-full px-2 py-0.5 text-xs">
                    {child.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const pathname = location.pathname
  const [isCollapsed, setIsCollapsed] = useState(false)
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed))
  }, [isCollapsed])

  // Track expanded menu items
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    // Auto-expand menu containing current path on initial load
    const initialExpanded = new Set<string>()
    for (const item of SidebarContent) {
      if (item.children?.some((child) => child.url === pathname)) {
        initialExpanded.add(item.id)
      }
    }
    return initialExpanded
  })

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(menuId)) {
        next.delete(menuId)
      } else {
        next.add(menuId)
      }
      return next
    })
  }

  const filteredSidebarContent = useMemo((): MenuItem[] => {
    if (currentUser?.isSuperAdmin) return SidebarContent
    const granted = new Set(currentUser?.permissionCodes ?? [])
    return SidebarContent.flatMap((item) => {
      const children = item.children?.filter(
        (child) => !child.permission || granted.has(child.permission),
      )
      if (item.permission && !granted.has(item.permission)) return []
      if (item.children && !children?.length) return []
      return [{ ...item, children }]
    })
  }, [currentUser?.isSuperAdmin, currentUser?.permissionCodes])

  return (
    <aside
      className={cn(
        'border-border bg-sidebar fixed top-0 left-0 z-10 flex h-screen flex-col border-r transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-67.5',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'mt-5 flex h-20 items-center',
          isCollapsed ? 'px-3' : 'px-6',
        )}
      >
        <Link
          to="/dashboard"
          className={cn(
            'flex h-20 w-full items-center justify-center',
            isCollapsed && 'px-1',
          )}
        >
          {isCollapsed ? (
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl">
              <Logo />
            </div>
          ) : (
            <FullLogo />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <SimpleBar className="flex-1 overflow-y-auto">
        <nav className={cn('space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
          {filteredSidebarContent.map((item, index) => (
            <div key={item.id}>
              {!isCollapsed &&
                (index === 0 || item.section !== filteredSidebarContent[index - 1]?.section) && (
                  <p className="text-muted-foreground mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] first:mt-0">
                    {t(item.section ?? 'sidebar.sections.other')}
                  </p>
                )}
              <CollapsibleMenuItem
                item={item}
                isExpanded={expandedMenus.has(item.id)}
                onToggle={() => toggleMenu(item.id)}
                currentPath={pathname}
                onClose={onClose}
                t={t}
                badgeCounts={{}}
                isCollapsed={isCollapsed}
              />
            </div>
          ))}
        </nav>
      </SimpleBar>

      {/* Footer collapse toggle */}
      <div className={cn('mt-auto hidden p-3 md:block', isCollapsed && 'px-2')}>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-10 overflow-hidden rounded-full p-0 text-sidebar-foreground hover:bg-primary/10 hover:text-primary',
            isCollapsed
              ? 'mx-auto w-10 justify-center'
              : 'ml-auto w-full justify-start px-3',
          )}
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <Icon
            icon={
              isCollapsed
                ? 'solar:double-alt-arrow-right-linear'
                : 'solar:double-alt-arrow-left-linear'
            }
            className="size-5 shrink-0"
          />
          {!isCollapsed && <span className="text-sm font-medium">Thu gọn</span>}
        </Button>
      </div>
    </aside>
  )
}

export default SidebarLayout
