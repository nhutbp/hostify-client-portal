import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center ${className}`}>
      <ol className="flex items-center gap-1 text-sm">
        {/* Home link */}
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-slate-400 transition-colors hover:text-orange-500 dark:text-slate-500 dark:hover:text-orange-400"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  {item.icon}
                  <span className="max-w-50 truncate">{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
