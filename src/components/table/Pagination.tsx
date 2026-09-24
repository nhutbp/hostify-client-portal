// Pagination - Reusable pagination component
// Supports server-side pagination with page numbers, ellipsis, and page size selector
import { useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationProps {
  pagination: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  /** Number of items currently displayed */
  displayedCount?: number
  /** Page size options */
  pageSizeOptions?: number[]
  /** Custom class name */
  className?: string
}

export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  displayedCount,
  pageSizeOptions = [5, 10, 20, 50, 100, 200, 300],
  className = '',
}: PaginationProps) {
  const currentPage = pagination.page
  const totalPages = pagination.totalPages
  const itemsDisplayed = displayedCount ?? pagination.limit

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages])

  return (
    <div
      className={`flex w-full min-w-0 max-w-full flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-3 py-4 sm:flex-row sm:items-center sm:px-5 dark:border-slate-700 dark:bg-slate-800/50 ${className}`}
    >
      <div className="flex items-center gap-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Hiển thị{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {itemsDisplayed}
          </span>{' '}
          /{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {pagination.total}
          </span>
        </p>
        {onPageSizeChange && (
          <select
            value={pagination.limit}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-22 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-white"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain sm:w-auto">
        <div className="flex min-w-max items-center gap-1">
          {/* First page */}
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-slate-400 dark:text-slate-500"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  page === currentPage
                    ? 'bg-primary text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'hover:bg-primary-500 border border-slate-200 text-slate-600 hover:text-white dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ),
          )}

          {/* Next page */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange?.(totalPages)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
