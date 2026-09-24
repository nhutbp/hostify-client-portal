import { ChevronDown, ChevronRight } from 'lucide-react'
import type { AdminPermission } from '../../../types'
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from '../../../../../../../shared/permissions'
import { Switch } from '@/components/ui/switch'

const actionLabels = {
  view: 'Xem',
  create: 'Tạo',
  update: 'Chỉnh sửa',
  delete: 'Xóa',
  approve: 'Phê duyệt',
} as const

export function PermissionModule({
  module,
  permissions,
  selectedCodes,
  expanded,
  disabled,
  onExpand,
  onToggle,
  onToggleModule,
}: {
  module: string
  permissions: AdminPermission[]
  selectedCodes: string[]
  expanded: boolean
  disabled: boolean
  onExpand: () => void
  onToggle: (code: string) => void
  onToggleModule: () => void
  t: (key: string) => string
}) {
  const definition = PERMISSION_MODULES.find((item) => item.code === module)
  const resources = [...new Set(permissions.map(({ resource }) => resource))]
  const selectedCount = permissions.filter(({ code }) =>
    selectedCodes.includes(code),
  ).length
  const allSelected =
    permissions.length > 0 && selectedCount === permissions.length

  return (
    <section className="border-b border-slate-200 last:border-b-0">
      <div className="flex min-h-11 items-center gap-2 px-3">
        <button
          type="button"
          onClick={onExpand}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          <strong className="truncate text-sm">
            {definition?.name ?? module}
          </strong>
        </button>
        <span className="text-xs text-slate-500">
          {selectedCount}/{permissions.length} quyền
        </span>
        <Switch
          checked={allSelected}
          disabled={disabled}
          onCheckedChange={onToggleModule}
        />
      </div>

      {expanded && (
        <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/60 p-3">
          <div className="min-w-[620px] overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid grid-cols-[minmax(190px,1fr)_repeat(5,76px)] border-b bg-slate-50 text-[10px] font-semibold uppercase text-slate-500">
              <span className="px-3 py-2">Quyền</span>
              {PERMISSION_ACTIONS.map((action) => (
                <span key={action} className="px-1 py-2 text-center">
                  {actionLabels[action]}
                </span>
              ))}
            </div>
            {resources.map((resource) => {
              const resourceDefinition = definition?.resources.find(
                (item) => item.code === resource,
              )
              return (
                <div
                  key={resource}
                  className="grid min-h-11 grid-cols-[minmax(190px,1fr)_repeat(5,76px)] items-center border-b border-slate-100 last:border-0"
                >
                  <div className="px-3 py-2">
                    <strong className="block text-xs font-medium text-slate-800">
                      {resourceDefinition?.name ?? resource}
                    </strong>
                    <small className="text-[10px] text-slate-400">
                      {module}.{resource}
                    </small>
                  </div>
                  {PERMISSION_ACTIONS.map((action) => {
                    const permission = permissions.find(
                      (item) =>
                        item.resource === resource && item.action === action,
                    )
                    const checked = Boolean(
                      permission && selectedCodes.includes(permission.code),
                    )
                    return (
                      <div key={action} className="flex justify-center">
                        {permission ? (
                          <input
                            type="checkbox"
                            aria-label={`${actionLabels[action]} ${resourceDefinition?.name ?? resource}`}
                            checked={checked}
                            disabled={disabled}
                            onChange={() => onToggle(permission.code)}
                            className="size-4 rounded accent-primary-700"
                          />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
