export const serviceStatusLabels: Record<string, string> = {
  PENDING: 'Chờ kích hoạt',
  PROVISIONING: 'Đang cấp phát',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm ngưng',
  EXPIRED: 'Hết hạn',
  TERMINATED: 'Đã chấm dứt',
  ERROR: 'Có lỗi',
}

export const billingCycleLabels: Record<string, string> = {
  MONTHLY: 'tháng',
  QUARTERLY: 'quý',
  SEMI_ANNUAL: '6 tháng',
  YEARLY: 'năm',
  ONE_TIME: 'lần',
}

export function serviceStatusPresentation(
  status: string,
  daysRemaining: number | null,
) {
  if (
    status === 'ACTIVE' &&
    daysRemaining !== null &&
    daysRemaining >= 0 &&
    daysRemaining <= 7
  )
    return {
      label: 'Sắp hết hạn',
      className: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    }
  if (status === 'ACTIVE')
    return {
      label: serviceStatusLabels.ACTIVE,
      className: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    }
  if (status === 'PENDING' || status === 'PROVISIONING')
    return {
      label: serviceStatusLabels[status],
      className: 'bg-blue-100 text-blue-700',
      dot: 'bg-blue-500',
    }
  if (status === 'ERROR' || status === 'EXPIRED' || status === 'TERMINATED')
    return {
      label: serviceStatusLabels[status] ?? status,
      className: 'bg-rose-100 text-rose-700',
      dot: 'bg-rose-500',
    }
  return {
    label: serviceStatusLabels[status] ?? status,
    className: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-500',
  }
}

export function formatServiceDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : '—'
}

export function formatServicePrice(
  amountMinor: number | null,
  currency: string | null,
  billingCycle: string | null,
) {
  if (amountMinor === null || !currency) return '—'
  const money = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor)
  return billingCycle
    ? `${money}/${billingCycleLabels[billingCycle] ?? billingCycle.toLowerCase()}`
    : money
}
