import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'
import { cn } from '@/utils/utils'

const radioGroupBase = 'grid gap-3'
const radioGroupItemBase =
  'aspect-square size-4 shrink-0 rounded-full border border-gray-200 bg-white shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300/50 dark:focus-visible:ring-primary-600/50 focus-visible:border-primary-300 dark:focus-visible:border-primary-600 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error-500 aria-invalid:ring-error-500/20 dark:aria-invalid:border-error-500 dark:aria-invalid:ring-error-500/40 text-primary dark:border-gray-600 dark:bg-gray-800'

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    className={cn(radioGroupBase, className)}
    {...props}
  />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-group-item"
    className={cn(radioGroupItemBase, className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator
      data-slot="radio-group-indicator"
      className="relative flex items-center justify-center"
    >
      <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
