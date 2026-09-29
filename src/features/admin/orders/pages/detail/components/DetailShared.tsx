import { useTranslation } from 'react-i18next'

const statusClasses: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROVISIONING: 'bg-violet-100 text-violet-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  REFUNDED: 'bg-sky-100 text-sky-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  TERMINATED: 'bg-slate-100 text-slate-700',
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation('adminOrders')
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${statusClasses[status] ?? 'bg-slate-100 text-slate-700'}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t(`statuses.${status}`, { defaultValue: status })}
    </span>
  )
}

export function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span
        className={`min-w-0 break-words text-right ${strong ? 'font-semibold text-[#11184c]' : 'text-[#26365e]'}`}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

export function useOrderFormat() {
  const { i18n } = useTranslation()
  return {
    money: (amount: number, currency: string) =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount),
    date: (value: string | null) =>
      value
        ? new Intl.DateTimeFormat(i18n.language, {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(value))
        : '—',
    day: (value: string | null) =>
      value
        ? new Intl.DateTimeFormat(i18n.language, {
            dateStyle: 'medium',
          }).format(new Date(value))
        : '—',
  }
}
