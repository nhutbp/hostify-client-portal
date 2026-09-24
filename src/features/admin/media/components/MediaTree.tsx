import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react'
import { cn } from '@/utils/utils'
import { getIcon } from './media-utils'
import type { MediaItem } from './types'

export function MediaTree({
  item,
  selectedId,
  onSelect,
  expanded,
  toggleExpanded,
  depth = 0,
}: {
  item: MediaItem
  selectedId: string | null
  onSelect: (item: MediaItem) => void
  expanded: Set<string>
  toggleExpanded: (id: string) => void
  depth?: number
}) {
  const Icon =
    item.type === 'folder' && expanded.has(item.id) ? FolderOpen : getIcon(item)
  const isExpanded = expanded.has(item.id)
  const hasChildren = Boolean(item.children?.length)
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-primary-50 hover:text-primary dark:hover:bg-primary/10',
          selectedId === item.id &&
            'bg-primary-50 font-medium text-primary dark:bg-primary/15',
        )}
        style={{ paddingLeft: `${10 + depth * 20}px` }}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation()
              toggleExpanded(item.id)
            }}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Icon size={15} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
        {item.size !== undefined && item.type === 'folder' && (
          <span className="text-[11px] text-slate-400">{item.size}</span>
        )}
      </button>
      {isExpanded &&
        item.children?.map((child) => (
          <MediaTree
            key={child.id}
            item={child}
            selectedId={selectedId}
            onSelect={onSelect}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}
