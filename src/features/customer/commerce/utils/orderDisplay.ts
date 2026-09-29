export const orderStatuses: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  DRAFT: {
    label: 'Bản nháp',
    className:
      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
    dot: 'bg-slate-500',
  },
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  PAID: {
    label: 'Đã thanh toán',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200',
    dot: 'bg-blue-500',
  },
  PROVISIONING: {
    label: 'Đang cấp phát',
    className:
      'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200',
    dot: 'bg-violet-500',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    label: 'Thất bại',
    className:
      'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200',
    dot: 'bg-rose-500',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className:
      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
    dot: 'bg-slate-500',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200',
    dot: 'bg-sky-500',
  },
}

export const paymentMethodLabels: Record<string, string> = {
  WALLET: 'Ví điện tử',
  MOMO: 'MoMo',
  VIETQR: 'VietQR / Ngân hàng',
  CARD: 'Thẻ ngân hàng',
  USDT_TRC20: 'USDT (TRC20)',
}

export function orderStatus(status: string) {
  return {
    ...(orderStatuses[status] ?? {
      label: status,
      className:
        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
      dot: 'bg-slate-500',
    }),
    labelKey: `customerOrders.status.${status}`,
  }
}

export function orderMoney(
  amountMinor: number,
  currency: string,
  locale = 'vi',
) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor)
}

export function orderDate(value: string, locale = 'vi') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
