import { cn } from '@/utils/utils'

export type TabItem<T extends string = string> = {
  value: T
  label: string
  disabled?: boolean
}

type TabsProps<T extends string = string> = {
  items: TabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  ariaLabel: string
  className?: string
  tabClassName?: string
  activeTabClassName?: string
}

export function Tabs<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  className,
  tabClassName,
  activeTabClassName,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'shrink-0 border-0 border-b-2 border-transparent bg-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
              tabClassName,
              active && 'border-primary text-primary',
              active && activeTabClassName,
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
