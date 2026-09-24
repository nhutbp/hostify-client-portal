import React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

interface DatePickerProps {
  value?: Date | undefined
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  error?: boolean
  className?: string
  disabled?: boolean
  /** Minimum selectable date (inclusive) */
  minDate?: Date
  /** Maximum selectable date (inclusive) */
  maxDate?: Date
  /** Predicate to disable specific dates. Receives a Date and should return true to disable it. */
  dateDisabled?: (date: Date) => boolean
  required?: boolean
  id?: string
  name?: string
}

/**
 * DatePicker component following Figma design rules
 * - Border: 1px solid #d0d5dd (Gray/300)
 * - Border radius: 8px
 * - Padding: 12px 16px
 * - Background: #ffffff
 * - Text: 16px, Inter Regular, line-height 24px
 * - Placeholder: #98a2b3 (Gray/400)
 * - Focus: Orange border and ring (#f58220)
 * - Error: Red border and ring (#d92d20)
 */
function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn thời gian',
  error,
  className,
  disabled,
  minDate,
  maxDate,
  dateDisabled,
  required,
  id,
  name,
  ...restProps
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          id={id}
          name={name}
          aria-required={required}
          aria-invalid={error}
          className={cn(
            // Override with Figma styles - match Input exactly
            'h-auto rounded-lg border-gray-300 bg-white px-4 py-3 text-base leading-6 font-normal text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100',
            'w-full justify-between text-left',
            'focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-1 dark:focus-visible:border-primary dark:focus-visible:ring-primary',
            // Error state
            error &&
              'border-error-600 focus-visible:border-error-600 focus-visible:ring-error-600 focus-visible:ring-1 dark:border-error-500 dark:focus-visible:border-error-500 dark:focus-visible:ring-error-500',
            // Placeholder styling
            !value && 'text-gray-400 dark:text-gray-500',
            // Disabled state
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          {...restProps}
        >
          {value ? format(value, 'dd/MM/yyyy') : <span>{placeholder}</span>}
          <CalendarIcon className="size-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border border-gray-300 bg-white p-0 dark:border-gray-700 dark:bg-gray-900"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
          {...(minDate && { fromDate: minDate })}
          {...(maxDate && { toDate: maxDate })}
          {...(dateDisabled && { disabled: dateDisabled })}
        />
      </PopoverContent>
    </Popover>
  )
}

export type { DatePickerProps }
export { DatePicker }
