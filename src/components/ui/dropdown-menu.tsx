import * as React from 'react'
import { cn } from '@/utils/utils'

type DropdownMenuContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  close: () => void
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(
      'DropdownMenu components must be used inside <DropdownMenu>',
    )
  }
  return context
}

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const close = React.useCallback(() => setOpen(false), [])

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, close }}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLElement, TriggerProps>(
  ({ asChild, onClick, children, type, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuContext()
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>)
      if (!event.defaultPrevented) {
        setOpen((prev) => !prev)
      }
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        ...props,
        'aria-expanded': open,
        onClick: handleClick,
      })
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? 'button'}
        aria-expanded={open}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  },
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'end'
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, ContentProps>(
  (
    { className, align = 'start', sideOffset = 4, style, children, ...props },
    ref,
  ) => {
    const { open } = useDropdownMenuContext()

    if (!open) {
      return null
    }

    return (
      <div
        ref={ref}
        role="menu"
        style={{
          top: `calc(100% + ${sideOffset}px)`,
          ...(align === 'end' ? { right: 0 } : { left: 0 }),
          ...style,
        }}
        className={cn(
          'absolute z-50 min-w-40 overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

type ItemProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLElement, ItemProps>(
  ({ asChild, className, onClick, children, ...props }, ref) => {
    const { close } = useDropdownMenuContext()

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        close()
      }
    }

    const mergedClassName = cn(
      'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
      className,
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        ...props,
        className: cn(
          mergedClassName,
          (children.props as { className?: string }).className,
        ),
        onClick: handleClick,
      })
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        role="menuitem"
        className={mergedClassName}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  },
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)
const DropdownMenuRadioGroup = ({
  children,
}: {
  children: React.ReactNode
}) => <>{children}</>
const DropdownMenuSubTrigger = React.forwardRef<HTMLElement, ItemProps>(
  ({ children, ...props }, ref) => (
    <DropdownMenuItem ref={ref} {...props}>
      {children}
    </DropdownMenuItem>
  ),
)
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'
const DropdownMenuSubContent = ({
  children,
}: {
  children: React.ReactNode
}) => <>{children}</>
const DropdownMenuCheckboxItem = DropdownMenuItem
const DropdownMenuRadioItem = DropdownMenuItem
const DropdownMenuLabel = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  >
    {children}
  </div>
)
const DropdownMenuSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-border -mx-1 my-1 h-px', className)} {...props} />
)
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
    {...props}
  />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
