import { cn } from '@/utils/utils'
import type React from 'react'

interface PanelProps {
  children: React.ReactNode
  className?: string
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
        className,
      )}
    >
      {children}
    </div>
  )
}
