import * as React from 'react'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { InputProps } from '@/components/ui/input'
import { cn } from '@/utils/utils'

export interface InputFieldProps extends InputProps {
  label: string
  error?: React.ReactNode
  required?: boolean
  groupClassName?: string
  labelClassName?: string
  startIcon?: React.ReactNode
}

export function InputField({
  label,
  error,
  required,
  groupClassName,
  labelClassName,
  className,
  startIcon,
  id,
  variant,
  size,
  ...props
}: InputFieldProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const inputVariant = error ? 'error' : variant

  return (
    <Field className={cn('gap-3', groupClassName)}>
      <FieldLabel
        htmlFor={inputId}
        required={required}
        className={labelClassName}
      >
        {label}
      </FieldLabel>
      <FieldContent>
        {startIcon ? (
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">
              {startIcon}
            </span>
            <Input
              id={inputId}
              variant={inputVariant}
              size={size}
              className={cn('pl-12', className)}
              {...props}
            />
          </div>
        ) : (
          <Input
            id={inputId}
            variant={inputVariant}
            size={size}
            className={className}
            {...props}
          />
        )}
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
