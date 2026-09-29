import { Link } from '@tanstack/react-router'
import {
  ChevronDown,
  Globe2,
  Link2,
  Package,
  Server,
  UserRound,
  HardDrive,
} from 'lucide-react'
import type { customerServicesService } from '../services/customerServicesService'
import {
  formatServiceDate,
  formatServicePrice,
  serviceStatusPresentation,
} from '../utils/serviceDisplay'
import { useTranslation } from 'react-i18next'

type Row = Awaited<
  ReturnType<typeof customerServicesService.list>
>['items'][number]

const categoryStyle: Record<
  string,
  { icon: typeof Server; badge: string; tile: string }
> = {
  vps: {
    icon: Server,
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200',
    tile: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-200',
  },
  hosting: {
    icon: Globe2,
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200',
    tile: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-200',
  },
  physical: {
    icon: HardDrive,
    badge:
      'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200',
    tile: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-200',
  },
  proxy: {
    icon: Link2,
    badge:
      'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-200',
    tile: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-200',
  },
  via: {
    icon: UserRound,
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-200',
    tile: 'bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-200',
  },
}

export function CustomerServicesTable({
  rows,
  selected,
  onSelect,
  onSelectAll,
}: {
  rows: Row[]
  selected: Set<string>
  onSelect: (id: string) => void
  onSelectAll: () => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language
  const allSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id))
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead className="bg-muted text-xs font-semibold text-foreground">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                aria-label={t('customerServices.selectAll')}
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
              />
            </th>
            <th className="min-w-52 px-3 py-3">
              {t('customerServices.service')}
            </th>
            <th className="min-w-40 px-3 py-3">
              {t('customerServices.information')}
            </th>
            <th className="min-w-32 px-3 py-3">
              {t('customerServices.provider')}
            </th>
            <th className="min-w-36 px-3 py-3">
              {t('customerServices.payment')}
            </th>
            <th className="min-w-36 px-3 py-3">
              {t('customerServices.statusLabel')}
            </th>
            <th className="min-w-32 px-3 py-3">
              {t('customerServices.deadline')}
            </th>
            <th className="w-32 px-3 py-3">{t('customerServices.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const style = categoryStyle[row.category.slug] ?? {
              icon: Package,
              badge:
                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
              tile: 'bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-100',
            }
            const Icon = style.icon
            const status = serviceStatusPresentation(
              row.status,
              row.daysRemaining,
            )
            return (
              <tr
                key={row.id}
                className="bg-card transition hover:bg-primary/5"
              >
                <td className="px-4 py-3">
                  <input
                    aria-label={t('customerServices.selectService', {
                      name: row.productName,
                    })}
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => onSelect(row.id)}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${style.tile}`}
                    >
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <Link
                        to="/customer/dashboard/services/$id"
                        params={{ id: row.id }}
                        className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        {row.productName}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.serviceCode}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${style.badge}`}
                      >
                        {t(`customerCategories.${row.category.slug}`, {
                          defaultValue: row.category.name,
                        })}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {row.address ?? row.planName ?? '—'}
                  </p>
                  {row.details.slice(0, 2).map((detail) => (
                    <p key={detail} className="text-xs">
                      {detail}
                    </p>
                  ))}
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">{row.provider ?? '—'}</p>
                  {row.operatingSystem && (
                    <p
                      className="max-w-32 truncate text-xs text-muted-foreground"
                      title={row.operatingSystem}
                    >
                      {row.operatingSystem}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-blue-600 dark:text-blue-300">
                    {formatServicePrice(
                      row.amountMinor,
                      row.currency,
                      row.billingCycle,
                      locale,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.amountMinor === null
                      ? t('customerServices.noOrderPrice')
                      : t('customerServices.purchasePrice')}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    <span className={`size-1.5 rounded-full ${status.dot}`} />
                    {t(status.labelKey, { defaultValue: status.label })}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">
                    {formatServiceDate(row.expiresAt, locale)}
                  </p>
                  {row.daysRemaining !== null && (
                    <p className="text-xs text-muted-foreground">
                      {row.daysRemaining > 0
                        ? t('customerServices.remainingDays', {
                            count: row.daysRemaining,
                          })
                        : t('customerServices.due')}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center">
                    <Link
                      to="/customer/dashboard/services/$id"
                      params={{ id: row.id }}
                      className="rounded-l-lg border border-blue-200 bg-card px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-primary/10 dark:border-blue-800 dark:text-blue-300"
                    >
                      {t('customerServices.manage')}
                    </Link>
                    <details className="relative">
                      <summary
                        className="flex h-[38px] cursor-pointer list-none items-center rounded-r-lg border border-l-0 border-blue-200 px-2 text-blue-600 dark:border-blue-800 dark:text-blue-300"
                        aria-label={t('customerServices.actions')}
                      >
                        <ChevronDown size={14} />
                      </summary>
                      <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
                        <Link
                          to="/customer/dashboard/services/$id"
                          params={{ id: row.id }}
                          className="block rounded px-2 py-1.5 hover:bg-primary/10"
                        >
                          {t('customerServices.viewDetails')}
                        </Link>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
