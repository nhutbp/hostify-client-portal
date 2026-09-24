import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { InputProps } from '@/components/ui/input'
import { cn } from '@/utils/utils'

export interface InputFieldPasswordProps extends Omit<InputProps, 'type'> {
  label: string
  error?: React.ReactNode
  required?: boolean
  groupClassName?: string
  labelClassName?: string
  startIcon?: React.ReactNode
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  type?: 'password' | 'text'
  showPasswordLabel?: string
  hidePasswordLabel?: string
}

export function InputFieldPassword({
  label,
  error,
  required,
  groupClassName,
  labelClassName,
  className,
  startIcon,
  id,
  type = 'password',
  showPassword,
  setShowPassword,
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
  variant,
  size,
  ...props
}: InputFieldPasswordProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const resolvedType = showPassword ? 'text' : type
  const inputVariant = error ? 'error' : variant

  return (
    <Field className={groupClassName ?? 'gap-3'}>
      <FieldLabel
        htmlFor={inputId}
        required={required}
        className={labelClassName}
      >
        {label}
      </FieldLabel>
      <FieldContent>
        <div className="relative">
          <Input
            id={inputId}
            type={resolvedType}
            variant={inputVariant}
            size={size}
            className={cn(startIcon && 'pl-12', 'pr-14', className)}
            {...props}
          />
          {startIcon ? (
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">
              {startIcon}
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="absolute inset-y-0 right-0 h-full w-12 p-0"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
