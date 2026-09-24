import type { RowData } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { appTableFeatures } from './tableConfig'

export interface IndexColumnOptions {
  page: number
  pageSize: number
  showMobile?: boolean
}

function createIndexColumn<TData extends RowData>({
  page,
  pageSize,
  showMobile,
}: IndexColumnOptions): ColumnDef<typeof appTableFeatures, TData, unknown> {
  const offset = Math.max(0, (page - 1) * pageSize)

  return {
    id: 'index',
    meta: { showMobile },
    size: 72,
    header: 'STT',
    cell: ({ row }) => (
      <span className="inline-flex min-w-8 justify-center text-sm font-medium text-slate-500 dark:text-slate-400">
        {offset + row.index + 1}
      </span>
    ),
  }
}

export { createIndexColumn }
