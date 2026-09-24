const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  open: 'Open',
  created: 'Created',
  at_hub: 'At hub',
  delayed: 'Delayed',
  batched: 'Batched',
  shipping: 'Shipping',
  merged: 'Merged',
  in_progress: 'In progress',
  assigned: 'Assigned',
  in_transit: 'In transit',
  delivered: 'Delivered',
  picked: 'Picked',
  picked_up: 'Picked up',
  confirmed_pickup: 'Confirmed pickup',
  success: 'Success',
  active: 'Active',
  completed: 'Completed',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
  returned: 'Returned',
  failed: 'Failed',
  inactive: 'Inactive',
  pending_deletion: 'Pending deletion',
  closed: 'Closed',
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase()
  if (!normalized) {
    return ''
  }

  return STATUS_LABELS[normalized] ?? toTitleCase(normalized.replace(/_/g, ' '))
}
