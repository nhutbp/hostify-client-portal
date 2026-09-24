import * as React from 'react'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/utils/utils'

export interface CheckboxFieldProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Checkbox>,
  'checked'
> {
  label: string
  checked?: boolean
  error?: React.ReactNode
  required?: boolean
  description?: React.ReactNode
  groupClassName?: string
  labelClassName?: string
  checkboxClassName?: string
}

export function CheckboxField({
  label,
  checked,
  error,
  required,
  description,
  groupClassName,
  labelClassName,
  checkboxClassName,
  id,
  ...props
}: CheckboxFieldProps) {
  const generatedId = React.useId()
  const checkboxId = id ?? generatedId

  return (
    <Field className={cn('gap-2', groupClassName)}>
      <FieldContent>
        <div className="flex items-start gap-2">
          <Checkbox
            id={checkboxId}
            checked={checked}
            aria-invalid={Boolean(error)}
            className={cn('mt-0.5', checkboxClassName)}
            {...props}
          />
          <div className="min-w-0 flex-1">
            <FieldLabel
              htmlFor={checkboxId}
              required={required}
              className={cn('w-fit cursor-pointer', labelClassName)}
            >
              {label}
            </FieldLabel>
            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
