import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/utils'

const buttonBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:ring-primary-600 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

const buttonVariants = cva(buttonBase, {
  variants: {
    variant: {
      primary:
        'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
      secondary:
        'bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-hover',
      success:
        'bg-success text-white hover:bg-successemphasis active:bg-successemphasis',
      warning:
        'bg-warning text-white hover:bg-warningemphasis active:bg-warningemphasis',
      info: 'bg-info text-white hover:bg-infoemphasis active:bg-infoemphasis',
      error:
        'bg-error text-white hover:bg-erroremphasis active:bg-erroremphasis',
      outline:
        'border border-gray-300 bg-white text-gray-900 hover:bg-primary hover:text-white active:bg-primary-hover dark:bg-gray-900 dark:text-gray-100',
      outlinePrimary:
        'border border-primary text-primary hover:bg-primary hover:text-white active:bg-primary-hover',
      outlineSecondary:
        'border border-secondary text-secondary hover:bg-secondary hover:text-white active:bg-secondary-hover',
      outlineSuccess:
        'border border-success text-success hover:bg-success hover:text-white active:bg-successemphasis',
      outlineWarning:
        'border border-warning text-warning hover:bg-warning hover:text-white active:bg-warningemphasis',
      outlineInfo:
        'border border-info text-info hover:bg-info hover:text-white active:bg-infoemphasis',
      outlineError:
        'border border-error text-error hover:bg-error hover:text-white active:bg-erroremphasis',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-100 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
      ghostPrimary: 'text-primary hover:bg-primary-50 active:bg-primary-100',
      ghostSecondary:
        'text-secondary hover:bg-secondary-50 active:bg-secondary-100',
      ghostSuccess: 'text-success hover:bg-lightsuccess active:bg-lightsuccess',
      ghostWarning: 'text-warning hover:bg-lightwarning active:bg-lightwarning',
      ghostInfo: 'text-info hover:bg-lightinfo active:bg-lightinfo',
      ghostError: 'text-error hover:bg-lighterror active:bg-lighterror',
      lightPrimary:
        'bg-primary-50 text-primary hover:bg-primary hover:text-white active:bg-primary-hover',
      lightSecondary:
        'bg-secondary-50 text-secondary hover:bg-secondary hover:text-white active:bg-secondary-hover',
      lightSuccess:
        'bg-lightsuccess text-success hover:bg-success hover:text-white active:bg-successemphasis',
      lightWarning:
        'bg-lightwarning text-warning hover:bg-warning hover:text-white active:bg-warningemphasis',
      lightInfo:
        'bg-lightinfo text-info hover:bg-info hover:text-white active:bg-infoemphasis',
      lightError:
        'bg-lighterror text-error hover:bg-error hover:text-white active:bg-erroremphasis',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4 text-sm',
      lg: 'h-14 px-5 text-base',
      xl: 'h-16 px-6 text-base',
      xxl: 'h-18 px-6 text-lg',
    },
    shape: {
      pill: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm',
  },
})

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
