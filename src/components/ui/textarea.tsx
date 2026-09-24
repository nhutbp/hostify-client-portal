import * as React from 'react'
import { cn } from '@/utils/utils'

const textareaBase =
  'flex min-h-16 w-full field-sizing-content rounded-md border border-gray-200 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-gray-500 focus-visible:border-primary focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-error-500 aria-invalid:ring-error-500/20 dark:border-gray-600 dark:bg-input/30 dark:text-gray-400 dark:aria-invalid:border-error-500 dark:aria-invalid:ring-error-500/40'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(textareaBase, className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
