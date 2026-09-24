// ReusableDataTable - A reusable data table component using TanStack Table
// Designed for consistent UI across the application following CustomerManagement.tsx design
import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  SortingState,
  RowSelectionState,
  Updater,
} from '@tanstack/react-table'
import { Pagination } from './Pagination'
import type { PaginationMeta } from './Pagination'
import { cn } from '@/utils/utils'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    lastSelectedRowIndex?: React.MutableRefObject<number | null>
  }
  interface ColumnMeta<TData, TValue> {
    showMobile?: boolean
    headerClassName?: string
    cellClassName?: string
  }
}

export interface DataTableProps<TData> {
  // Data
  data: TData[]
  columns: ColumnDef<TData, any>[]

  // Pagination
  pagination?: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void

  // Loading & Empty states
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode

  // Row actions
  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string | undefined

  // Row selection
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  getRowId?: (row: TData) => string

  className?: string
}

// Empty state icon
const EmptyIcon = () => (
  <svg
    className="h-10 w-10 text-slate-200 dark:text-slate-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
)

// Loading skeleton row
const LoadingRow = ({ leafColumns }: { leafColumns: any[] }) => (
  <tr className="animate-pulse">
    {leafColumns.map((col) => {
      return (
        <td key={col.id} className="whitespace-nowrap px-4 py-3.5">
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        </td>
      )
    })}
  </tr>
)

export function Table<TData>({
  data,
  columns,
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  emptyIcon,
  onRowClick,
  getRowClassName,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  className = '',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(rowSelection !== undefined && { rowSelection }),
    },
    onSortingChange: setSorting,

    ...(getRowId && {
      getRowId,
    }),

    ...(onRowSelectionChange && {
      onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
        const newSelection =
          typeof updater === 'function' ? updater(rowSelection ?? {}) : updater

        onRowSelectionChange(newSelection)
      },
    }),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    enableRowSelection: rowSelection !== undefined,
  })

  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-full rounded-lg border bg-white dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
    >
      {/* Unified Table */}
      <div className="relative block w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr
              className={cn(
                'border-b border-slate-100 text-xs font-bold text-slate-400 dark:border-slate-700 dark:text-slate-500',
              )}
            >
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-2 py-3 text-left',
                        meta?.headerClassName,
                        header.column.getCanSort() &&
                          'cursor-pointer select-none',
                      )}
                      style={
                        header.column.columnDef.size !== undefined
                          ? {
                              width: header.column.getSize(),
                              minWidth: header.column.getSize(),
                            }
                          : undefined
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getIsSorted() && (
                          <span className="text-slate-600 dark:text-slate-400">
                            {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                }),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <LoadingRow key={i} leafColumns={table.getAllLeafColumns()} />
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-2 py-16 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    {emptyIcon ?? <EmptyIcon />}
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'group transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/60',
                    onRowClick && 'cursor-pointer',
                    getRowClassName?.(row.original),
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-2 py-3.5 text-sm text-slate-700 dark:text-slate-200',
                          meta?.cellClassName,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          displayedCount={data.length}
          {...(onPageChange ? { onPageChange } : {})}
          {...(onPageSizeChange ? { onPageSizeChange } : {})}
        />
      )}
    </div>
  )
}

export default Table
