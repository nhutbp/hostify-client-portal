import * as React from 'react'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/utils'

export interface CodeFieldProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  error?: React.ReactNode
  required?: boolean
  length?: number
  autoFocus?: boolean
  disabled?: boolean
  groupClassName?: string
  labelClassName?: string
  className?: string
}

export function CodeField({
  label,
  value,
  onChange,
  error,
  required,
  length = 6,
  autoFocus = false,
  disabled = false,
  groupClassName,
  labelClassName,
  className,
}: CodeFieldProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const focusAt = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const updateValue = (next: string[]) => {
    onChange(next.slice(0, length))
  }

  const handleCodeChange = (index: number, rawValue: string) => {
    if (rawValue && !/^\d$/.test(rawValue)) return

    const next = [...value]
    next[index] = rawValue
    updateValue(next)

    if (rawValue && index < length - 1) {
      focusAt(index + 1)
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      focusAt(index - 1)
      return
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1)
      return
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    const digits = pastedData.replace(/\D/g, '').slice(0, length)

    if (!digits) return

    const next = Array.from({ length }, (_, index) => digits[index] ?? '')
    updateValue(next)
    focusAt(Math.min(digits.length, length - 1))
  }

  return (
    <Field className={cn('gap-3', groupClassName)}>
      <FieldLabel required={required} className={labelClassName}>
        {label}
      </FieldLabel>
      <FieldContent>
        <div
          className={cn('grid w-full gap-2 sm:gap-3', className)}
          style={{
            gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length }, (_, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={value[index] ?? ''}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              variant="default"
              className="aspect-square h-auto w-full min-w-0 p-0 text-center text-base font-semibold sm:text-lg"
              aria-invalid={Boolean(error)}
              disabled={disabled}
              aria-label={`${label} ${index + 1}`}
            />
          ))}
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
