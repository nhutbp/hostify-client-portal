import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { DashboardArea } from '../../FullLayout'
import { getVisibleSidebarItems } from '../sidebar/getVisibleSidebarItems'
import { useCurrentUser } from '@/features/auth/store/authStore'
import { Icon } from '@iconify/react'
import SimpleBar from 'simplebar-react'
import { Input } from '@/components/ui/input'
import type { ChildItem, MenuItem } from '../sidebar/sidebaritem'

type SearchableItem = MenuItem | ChildItem
type SearchResult = { name: string; url: string; path: string }

function Search({ area }: { area: DashboardArea }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const currentUser = useCurrentUser()

  // 🔍 Recursive search through menu
  const searchItems = (
    items: SearchableItem[],
    q: string,
    parentPath = '',
  ): SearchResult[] => {
    let results: SearchResult[] = []

    items.forEach((item) => {
      const translatedName = t(item.titleKey)
      const currentPath = parentPath
        ? `${parentPath} → ${translatedName}`
        : translatedName

      // If match found
      if (
        !item.disabled &&
        translatedName.toLowerCase().includes(q.toLowerCase()) &&
        item.url
      ) {
        results.push({
          name: translatedName,
          url: item.url,
          path: currentPath,
        })
      }

      // Search deeper children
      if ('children' in item && item.children) {
        results = [...results, ...searchItems(item.children, q, currentPath)]
      }
    })

    return results
  }

  // Memoize filtered results
  const results = useMemo(() => {
    if (!query.trim()) return []
    const visibleItems = getVisibleSidebarItems(
      area,
      currentUser?.permissionCodes,
      currentUser?.isSuperAdmin,
    )
    return searchItems(
      visibleItems.filter((item) => !item.disabled),
      query,
    )
  }, [area, currentUser?.isSuperAdmin, currentUser?.permissionCodes, query, t])

  return (
    <div className="relative w-full">
      <div className="relative mx-auto flex items-center lg:w-[464px]">
        <Icon
          icon="solar:magnifer-linear"
          width="18"
          height="18"
          className="absolute top-1/2 left-3 -translate-y-1/2"
        />

        <Input
          placeholder={
            area === 'customer'
              ? t('customerShell.searchPlaceholder')
              : t('sidebar.searchPlaceholder')
          }
          className="h-[34px]! rounded-lg! bg-background! py-1! pl-10 text-foreground"
          aria-label={t('layout.search')}
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className={`absolute inset-s-0 top-10 z-10 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md ${
          query ? 'block' : 'hidden'
        }`}
      >
        <SimpleBar className="custom-scroll h-72 p-4">
          {results.length ? (
            results.map((item, i) => (
              <Link
                key={i}
                to={item.url}
                onClick={() => setQuery('')}
                className="bg-input/30 hover:bg-primary/20 hover:text-primary mb-1.5 flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium last:mb-0"
              >
                <div className="flex items-center">
                  <Icon icon="iconoir:component" width={18} height={18} />
                  <div className="ps-3">
                    <h5 className="group-hover/link:text-primary mb-1 text-sm">
                      {item.name}
                    </h5>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.path}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <h1 className="text-medium text-ld font-medium">
                {t('layout.noSearchResults')}
              </h1>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  )
}

export default Search
