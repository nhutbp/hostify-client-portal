import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 dark:ring-primary-600',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white',
        primary: 'border-transparent bg-primary text-white',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        success: 'border-transparent bg-success text-white',
        warning: 'border-transparent bg-warning text-white',
        info: 'border-transparent bg-info text-white',
        error: 'border-transparent bg-error text-white',
        outline: 'border-primary text-primary',
        outlinePrimary: 'border-primary text-primary',
        outlineSecondary: 'border-secondary text-secondary',
        outlineSuccess: 'border-success text-success',
        outlineWarning: 'border-warning text-warning',
        outlineError: 'border-error text-error',
        outlineInfo: 'border-info text-info',
        lightPrimary: 'border-0 bg-lightprimary text-primary',
        lightSecondary: 'border-0 bg-lightsecondary text-secondary',
        lightSuccess: 'border-0 bg-lightsuccess text-success',
        lightWarning: 'border-0 bg-lightwarning text-warning',
        lightInfo: 'border-0 bg-lightinfo text-info',
        lightError: 'border-0 bg-lighterror text-error',
        gray: 'border-transparent bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
