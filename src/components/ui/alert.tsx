import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/utils'

const alertVariants = cva(
  'relative w-full rounded-lg p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-900 dark:text-gray-100',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100',
        primary: 'bg-primary text-white',
        secondary:
          'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        success: 'bg-success text-white',
        error: 'bg-error text-white',
        warning: 'bg-warning text-white',
        info: 'bg-info text-white',
        lightPrimary: 'bg-lightprimary text-primary [&>svg]:text-primary',
        lightSecondary:
          'bg-lightsecondary text-secondary [&>svg]:text-secondary',
        lightSuccess: 'bg-lightsuccess text-success [&>svg]:text-success',
        lightWarning: 'bg-lightwarning text-warning [&>svg]:text-warning',
        lightError: 'bg-lighterror text-error [&>svg]:text-error',
        lightInfo: 'bg-lightinfo text-info [&>svg]:text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  ),
)
Alert.displayName = 'Alert'

const alertTitleBase = 'mb-1 leading-none font-medium tracking-tight'
const alertDescriptionBase = 'text-sm [&_p]:leading-relaxed'

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<'h5'>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn(alertTitleBase, className)} {...props} />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(alertDescriptionBase, className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
