import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { cn } from '@/utils/utils'

const selectTriggerBase =
  "flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg border text-sm outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-placeholder:text-gray-500 dark:data-placeholder:text-gray-400"

const selectContentBase =
  'relative z-50 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-white text-gray-900 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

const selectLabelBase = 'px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400'

const selectItemBase =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm transition-colors outline-none select-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-700 dark:focus:text-gray-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-gray-500 dark:[&_svg:not([class*='text-'])]:text-gray-400"

const selectSeparatorBase =
  'pointer-events-none -mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700'

const selectScrollBase = 'flex cursor-default items-center justify-center py-1'

const selectVariants = cva(selectTriggerBase, {
  variants: {
    variant: {
      default:
        'border-slate-200 bg-white text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300 aria-invalid:border-error-500 aria-invalid:ring-2 aria-invalid:ring-error-500/20 dark:bg-slate-950 dark:text-slate-50 dark:border-slate-800',
      secondary:
        'border-secondary bg-secondary/10 text-secondary focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary dark:border-secondary dark:bg-secondary/10 dark:focus-visible:border-secondary dark:focus-visible:ring-secondary',
      info: 'border-info bg-info/10 text-info focus-visible:border-info focus-visible:ring-2 focus-visible:ring-info dark:border-info dark:bg-info/10 dark:focus-visible:border-info dark:focus-visible:ring-info',
      error:
        'border-error bg-error/10 text-error focus-visible:border-error focus-visible:ring-2 focus-visible:ring-error dark:border-error dark:bg-error/10 dark:focus-visible:border-error dark:focus-visible:ring-error',
      warning:
        'border-warning bg-warning/10 text-warning focus-visible:border-warning focus-visible:ring-2 focus-visible:ring-warning dark:border-warning dark:bg-warning/10 dark:focus-visible:border-warning dark:focus-visible:ring-warning',
      success:
        'border-success bg-success/10 text-success focus-visible:border-success focus-visible:ring-2 focus-visible:ring-success dark:border-success dark:bg-success/10 dark:focus-visible:border-success dark:focus-visible:ring-success',
      filter:
        'border-gray-200 bg-gray-50 text-gray-900 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-primary-600',
    },
    size: {
      sm: 'h-10 px-3 py-2 text-sm',
      md: 'h-12 px-4 py-3 text-sm',
      lg: 'h-14 px-5 py-4 text-base',
      xl: 'h-16 px-6 py-4 text-base',
      xxl: 'h-18 px-6 py-5 text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
})

type SelectVariant = VariantProps<typeof selectVariants>['variant']
type SelectSize = VariantProps<typeof selectVariants>['size']

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

export interface SelectTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, variant, size, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(selectVariants({ variant, size }), className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          selectContentBase,
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(selectLabelBase, className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectItemBase, className)}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(selectSeparatorBase, className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(selectScrollBase, className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(selectScrollBase, className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectVariants,
}
export type { SelectSize, SelectVariant }
