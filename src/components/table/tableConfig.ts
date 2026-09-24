import {
  columnSizingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  createTableHook,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'

export type TableColumnMeta = {
  showMobile?: boolean
  headerClassName?: string
  cellClassName?: string
}

export type TableMeta = {
  lastSelectedRowIndex?: React.MutableRefObject<number | null>
}

export const appTableFeatures = tableFeatures({
  columnSizingFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowSelectionFeature,
  rowPaginationFeature,
  columnMeta: metaHelper<TableColumnMeta>(),
  tableMeta: metaHelper<TableMeta>(),
})

export const {
  createAppColumnHelper,
  useAppTable,
} = createTableHook({ features: appTableFeatures })
