import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Eye, Pencil, X, Printer, Check } from 'lucide-react'
import { cn } from '@/utils/utils'

/**
 * Common TableActions Component
 * Reusable action buttons for table rows
 *
 * Design Specs (from Figma):
 * - Icon size: 20px (size-5) - Auto from Icon component
 * - Button size: icon-only (no padding) - handled via className
 * - Gap between buttons: 12px (gap-3)
 * - Colors: gray-500 default, secondary/error on hover
 *
 * Actions:
 * - View: Eye icon, hover blue (secondary)
 * - Edit: Pencil icon, hover blue (secondary)
 * - Delete: X icon, hover red (error)
 */

interface TableActionButtonProps extends Omit<ButtonProps, 'children'> {
  label: string
  children: ReactNode
  tone?: 'default' | 'danger' | 'success'
}

function TableActionButton({
  label,
  children,
  tone = 'default',
  className,
  asChild = false,
  ...props
}: TableActionButtonProps) {
  const content = asChild ? (
    children
  ) : (
    <>
      {children}
      <span className="sr-only">{label}</span>
    </>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={
            tone === 'danger'
              ? 'ghostError'
              : tone === 'success'
                ? 'ghostSuccess'
                : 'ghost'
          }
          size="sm"
          asChild={asChild}
          className={cn(
            'h-8 w-8 border-0 bg-transparent p-0 shadow-none',
            className,
          )}
          aria-label={label}
          title={label}
          {...props}
        >
          {content}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

interface TableActionsProps<TData extends { id: string | number }> {
  row: TData
  /** Base URL for view/edit navigation. */
  baseUrl: string
  /** Custom view handler (optional, defaults to navigation) */
  onView?: (id: string | number, row: TData) => void | Promise<void>
  /** Delete handler. Second arg (row) is optional for callers that need extra data */
  onDelete?: (id: string | number, row?: TData) => void | Promise<void>
  /** Custom edit handler (optional, defaults to navigation) */
  onEdit?: (id: string | number) => void
  /** Static additional search params for view page */
  viewSearchParams?: Record<string, any>
  /** Show/hide specific actions */
  actions?: {
    view?: boolean
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
  /** Print handler */
  onPrint?: (id: string | number) => void
  /** If true, append repo=processing to view URL */
  isProcessingRepo?: boolean
  isStatus?: string
  /** Handler for verify/check action (used for at_hub status) */
  onVerify?: (id: string | number) => void
  /** Permission flags to control action visibility */
  canView?: boolean
  canUpdate?: boolean
  canCreate?: boolean
  canDelete?: boolean
}

function TableActions<TData extends { id: string | number }>({
  row,
  baseUrl,
  onView,
  onDelete,
  onEdit,
  onPrint,
  onVerify,
  viewSearchParams,
  isStatus,
  actions = { view: true, edit: true, delete: true, print: false },
  canView = true,
  canUpdate = true,
  canDelete = true,
}: TableActionsProps<TData>) {
  const navigate = useNavigate()
  const itemId = row.id.toString()
  const isHubVerify = isStatus === 'at_hub'

  const handleView = () => {
    if (onView) {
      void onView(row.id, row)
      return
    }
    const rowStatus = (row as any).status
    navigate({
      to: `${baseUrl}/$id`,
      params: {},
      search: {
        ...viewSearchParams,
        ...(rowStatus && { status: rowStatus }),
      },
    })
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(row.id)
    } else {
      const rowStatus = (row as any).status
      navigate({
        to: `${baseUrl}/${itemId}/edit` as never,
        search: {
          ...viewSearchParams,
          ...(rowStatus && { status: rowStatus }),
        },
      })
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(row.id, row)
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint(row.id)
    }
  }

  const handleVerify = () => {
    if (onVerify) {
      onVerify(row.id)
    }
  }

  if (isHubVerify) {
    return (
      <div className="flex items-center gap-0.5">
        <TableActionButton label="Xác thực" onClick={handleVerify}>
          <Check className="size-4" />
        </TableActionButton>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* View */}
      {actions.view && canView && (
        <TableActionButton label="Xem chi tiết" onClick={handleView}>
          <Eye className="size-4" />
        </TableActionButton>
      )}

      {/* Print */}
      {actions.print && canView && (
        <TableActionButton label="In đơn" onClick={handlePrint}>
          <Printer className="size-4" />
        </TableActionButton>
      )}

      {/* Edit */}
      {actions.edit && canUpdate && (
        <TableActionButton label="Chỉnh sửa" onClick={handleEdit}>
          <Pencil className="size-4" />
        </TableActionButton>
      )}

      {/* Delete */}
      {actions.delete && canDelete && (
        <TableActionButton label="Xóa" tone="danger" onClick={handleDelete}>
          <X className="size-4" />
        </TableActionButton>
      )}
    </div>
  )
}

export type { TableActionButtonProps, TableActionsProps }
export { TableActionButton, TableActions }
