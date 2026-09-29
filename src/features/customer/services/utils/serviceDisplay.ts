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

const englishBillingCycleLabels: Record<string, string> = {
  MONTHLY: 'month',
  QUARTERLY: 'quarter',
  SEMI_ANNUAL: '6 months',
  YEARLY: 'year',
  ONE_TIME: 'time',
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
      labelKey: 'customerServices.status.EXPIRING',
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
      dot: 'bg-amber-500',
    }
  if (status === 'ACTIVE')
    return {
      label: serviceStatusLabels.ACTIVE,
      labelKey: 'customerServices.status.ACTIVE',
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
      dot: 'bg-emerald-500',
    }
  if (status === 'PENDING' || status === 'PROVISIONING')
    return {
      label: serviceStatusLabels[status],
      labelKey: `customerServices.status.${status}`,
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200',
      dot: 'bg-blue-500',
    }
  if (status === 'ERROR' || status === 'EXPIRED' || status === 'TERMINATED')
    return {
      label: serviceStatusLabels[status] ?? status,
      labelKey: `customerServices.status.${status}`,
      className:
        'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200',
      dot: 'bg-rose-500',
    }
  return {
    label: serviceStatusLabels[status] ?? status,
    labelKey: `customerServices.status.${status}`,
    className:
      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-100',
    dot: 'bg-slate-500',
  }
}

export function formatServiceDate(value: string | null, locale = 'vi') {
  return value
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN').format(
        new Date(value),
      )
    : '—'
}

export function formatServicePrice(
  amountMinor: number | null,
  currency: string | null,
  billingCycle: string | null,
  locale = 'vi',
) {
  if (amountMinor === null || !currency) return '—'
  const money = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor)
  const cycleLabels =
    locale === 'en' ? englishBillingCycleLabels : billingCycleLabels
  return billingCycle
    ? `${money}/${cycleLabels[billingCycle] ?? billingCycle.toLowerCase()}`
    : money
}
