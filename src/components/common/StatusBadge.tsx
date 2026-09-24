import { useMemo } from 'react'
import { getStatusLabel } from '@/constants/statusLabels'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalized = status.toLowerCase()

    if (
      [
        'pending',
        'open',
        'created',
        'remove_orders_pending',
        'at_hub',
        'delayed',
      ].includes(normalized)
    ) {
      return {
        bg: 'bg-warning-50 dark:bg-warning-900/30',
        text: 'text-warning-600 dark:text-warning-400',
      }
    }

    if (
      [
        'batched',
        'shipping',
        'merged',
        'in_progress',
        'assigned',
        'in_transit',
      ].includes(normalized)
    ) {
      return {
        bg: 'bg-info-50 dark:bg-info-900/30',
        text: 'text-info-600 dark:text-info-400',
      }
    }

    if (
      [
        'delivered',
        'picked',
        'picked_up',
        'confirmed_pickup',
        'success',
        'active',
        'completed',
        'resolved',
      ].includes(normalized)
    ) {
      return {
        bg: 'bg-success-50 dark:bg-success-900/30',
        text: 'text-success-600 dark:text-success-400',
      }
    }

    if (
      [
        'cancelled',
        'returned',
        'failed',
        'inactive',
        'pending_deletion',
        'closed',
      ].includes(normalized)
    ) {
      return {
        bg: 'bg-error-50 dark:bg-error-900/30',
        text: 'text-error-600 dark:text-error-400',
      }
    }

    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
    }
  }

  const config = getStatusConfig(status)

  const displayText = useMemo(() => {
    if (label) return label
    return getStatusLabel(status)
  }, [status, label])

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {displayText}
    </span>
  )
}

export { StatusBadge }
