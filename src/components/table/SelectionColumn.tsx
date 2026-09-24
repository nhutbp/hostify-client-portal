import type { RowData } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { appTableFeatures } from './tableConfig'

export interface SelectionColumnOptions {
  showMobile?: boolean
}

function createSelectionColumn<TData extends RowData>(
  options?: SelectionColumnOptions,
): ColumnDef<typeof appTableFeatures, TData, unknown> {
  return {
    id: 'select',
    meta: {
      showMobile: options?.showMobile,
    },
    size: 10,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(value === true)
        }
      />
    ),
    cell: ({ row, table }) => {
      const handleCheckboxClick = (e: React.MouseEvent) => {
        const meta = table.options.meta
        const lastSelectedRowIndex = meta?.lastSelectedRowIndex
        const isCurrentlySelected = row.getIsSelected()
        const newSelectedState = !isCurrentlySelected
        const lastIndex = lastSelectedRowIndex?.current

        if (e.shiftKey && lastIndex !== null && lastIndex !== undefined) {
          // Shift-click: select range
          const currentIndex = row.index

          if (lastIndex !== currentIndex) {
            const start = Math.min(lastIndex, currentIndex)
            const end = Math.max(lastIndex, currentIndex)
            const rows = table.getRowModel().rows

            // Select/deselect all rows in range
            for (let i = start; i <= Math.min(end, rows.length - 1); i++) {
              rows[i].toggleSelected(newSelectedState)
            }
          }
        } else {
          // Normal click: toggle single row
          row.toggleSelected(newSelectedState)
        }

        // Update last selected index
        if (lastSelectedRowIndex) {
          lastSelectedRowIndex.current = row.index
        }
      }

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={handleCheckboxClick}
          onCheckedChange={() => {
            // Handled by onClick to detect shift key
          }}
        />
      )
    },
  }
}

export { createSelectionColumn }
