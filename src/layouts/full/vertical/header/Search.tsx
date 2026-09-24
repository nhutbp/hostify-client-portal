import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import SidebarContent from '../sidebar/sidebaritem'
import { Icon } from '@iconify/react'
import SimpleBar from 'simplebar-react'
import { Input } from '@/components/ui/input'

function Search() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  // 🔍 Recursive search through menu
  const searchItems = (items: any[], q: string, parentPath = '') => {
    let results: any[] = []

    items.forEach((item) => {
      const translatedName = t(item.titleKey)
      const currentPath = parentPath
        ? `${parentPath} → ${translatedName}`
        : translatedName

      // If match found
      if (translatedName.toLowerCase().includes(q.toLowerCase()) && item.url) {
        results.push({
          name: translatedName,
          url: item.url,
          path: currentPath,
          icon: item.icon,
        })
      }

      // Search deeper children
      if (item.children) {
        results = [...results, ...searchItems(item.children, q, currentPath)]
      }
    })

    return results
  }

  // Memoize filtered results
  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchItems(SidebarContent, query)
  }, [query, t])

  return (
    <div className="relative w-full">
      <div className="relative mx-auto flex items-center lg:w-xs">
        <Icon
          icon="solar:magnifer-linear"
          width="18"
          height="18"
          className="absolute top-1/2 left-3 -translate-y-1/2"
        />

        <Input
          placeholder="Search...."
          className="h-10! rounded-lg! py-2! pl-10"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className={`dark:bg-dark border-ld absolute inset-s-0 top-10 z-10 w-full rounded-md border bg-white shadow-md ${
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
                    <span className="text-darklink block truncate text-xs">
                      {item.path}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <h1 className="text-medium text-ld font-medium">
                No Components Found!
              </h1>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  )
}

export default Search
