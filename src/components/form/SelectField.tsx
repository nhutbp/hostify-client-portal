import * as React from 'react'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { cn } from '@/utils/utils'

export type SelectFieldOption = { value: string; label: string }

export interface SelectFieldProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  label: string
  options: SelectFieldOption[]
  error?: React.ReactNode
  required?: boolean
  groupClassName?: string
  size?: string
  selectClassName?: string
}

export function SelectField({
  label,
  options,
  error,
  required,
  groupClassName,
  size: _size,
  selectClassName,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const generatedId = React.useId()
  const selectId = id ?? generatedId

  return (
    <Field className={cn('gap-3', groupClassName)}>
      <FieldLabel htmlFor={selectId} required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        <div className="relative">
          <select
            id={selectId}
            {...props}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border border-[#dfe6f0] bg-white px-3 pr-11 text-sm text-[#253555] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
              error && 'border-red-500',
              className,
              selectClassName,
            )}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
