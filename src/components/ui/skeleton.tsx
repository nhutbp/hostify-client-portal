import * as React from 'react'
import { cn } from '@/utils/utils'

const skeletonBase = 'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700'

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(skeletonBase, className)} {...props} />
))
Skeleton.displayName = 'Skeleton'

export { Skeleton }
