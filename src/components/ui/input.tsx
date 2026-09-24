import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/utils'

const inputBase =
  'flex w-full rounded-lg border text-sm file:mr-5 file:rounded-sm file:border-0 file:text-sm file:font-medium file:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none'

const inputVariants = cva(inputBase, {
  variants: {
    variant: {
      default:
        'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300 aria-invalid:border-error-500 aria-invalid:ring-2 aria-invalid:ring-error-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-400 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400 dark:aria-invalid:border-error-500 dark:aria-invalid:ring-error-500/30',
      secondary:
        'border-secondary bg-secondary/10 text-secondary placeholder-secondary focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary dark:border-secondary dark:bg-secondary/10 dark:focus-visible:border-secondary dark:focus-visible:ring-secondary',
      info: 'border-info bg-info/10 text-info placeholder-info focus-visible:border-info focus-visible:ring-2 focus-visible:ring-info dark:border-info dark:bg-info/10 dark:focus-visible:border-info dark:focus-visible:ring-info',
      error:
        'border-error bg-error/10 text-error placeholder-error focus-visible:border-error focus-visible:ring-2 focus-visible:ring-error dark:border-error dark:bg-error/10 dark:focus-visible:border-error dark:focus-visible:ring-error',
      warning:
        'border-warning bg-warning/10 text-warning placeholder-warning focus-visible:border-warning focus-visible:ring-2 focus-visible:ring-warning dark:border-warning dark:bg-warning/10 dark:focus-visible:border-warning dark:focus-visible:ring-warning',
      success:
        'border-success bg-success/10 text-success placeholder-success focus-visible:border-success focus-visible:ring-2 focus-visible:ring-success dark:border-success dark:bg-success/10 dark:focus-visible:border-success dark:focus-visible:ring-success',
      filter:
        'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 transition-all focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-primary-600',
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

export type InputVariant = VariantProps<typeof inputVariants>['variant']
export type InputSize = VariantProps<typeof inputVariants>['size']

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, size, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  ),
)

Input.displayName = 'Input'

export { Input, inputVariants }
