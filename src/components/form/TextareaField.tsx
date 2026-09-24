import * as React from 'react'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/utils'

export interface TextareaFieldProps extends React.ComponentPropsWithoutRef<
  typeof Textarea
> {
  label: string
  error?: React.ReactNode
  required?: boolean
  groupClassName?: string
  size?: string
}

export function TextareaField({
  label,
  error,
  required,
  groupClassName,
  size: _size,
  className,
  id,
  ...props
}: TextareaFieldProps) {
  const generatedId = React.useId()
  const textareaId = id ?? generatedId

  return (
    <Field className={cn('gap-3', groupClassName)}>
      <FieldLabel htmlFor={textareaId} required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        <Textarea
          id={textareaId}
          {...props}
          className={cn(error && 'border-red-500', className)}
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
