import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useCustomerOrders } from '../hooks/useCustomerOrder'
import { CustomerOrdersTable } from './components/CustomerOrdersTable'
import type { CustomerOrderFilters } from '../services/customerOrderService'
import { orderStatuses } from '../utils/orderDisplay'
import { useTranslation } from 'react-i18next'

const initialFilters: CustomerOrderFilters = {
  page: 1,
  limit: 10,
  sort: 'NEWEST',
}
const featuredStatuses = [
  { value: '' },
  { value: 'PENDING_PAYMENT' },
  { value: 'PAID' },
  { value: 'COMPLETED' },
  { value: 'CANCELLED' },
] as const

export default function CustomerOrdersPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<CustomerOrderFilters>(initialFilters)
  const [searchText, setSearchText] = useState('')
  const orders = useCustomerOrders(filters)
  const data = orders.data
  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setFilters((current) => ({
          ...current,
          search: searchText.trim() || undefined,
          page: 1,
        })),
      300,
    )
    return () => window.clearTimeout(timer)
  }, [searchText])
  function change(patch: Partial<CustomerOrderFilters>) {
    setFilters((current) => ({
      ...current,
      ...patch,
      page: 'page' in patch ? (patch.page ?? 1) : 1,
    }))
  }
  const rows = data?.items ?? []
  const first = rows.length ? (filters.page - 1) * filters.limit + 1 : 0
  const last = rows.length ? first + rows.length - 1 : 0
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div>
          <p className="text-sm text-muted-foreground">
            {t('customerOrders.breadcrumb')}
          </p>
          <h1 className="mt-1 text-3xl font-bold">
            {t('customerOrders.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('customerOrders.description')}
          </p>
        </div>
        <Link
          to="/customer/dashboard/buy"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} /> {t('customerOrders.buyMore')}
        </Link>
      </div>
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {featuredStatuses.map((entry) => (
            <button
              key={entry.value}
              type="button"
              onClick={() =>
                change({
                  status: (entry.value ||
                    undefined) as CustomerOrderFilters['status'],
                })
              }
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ${filters.status === (entry.value || undefined) ? 'border-blue-600 bg-blue-600 text-white' : 'border-border bg-background text-foreground hover:border-blue-300'}`}
            >
              {entry.value
                ? t(`customerOrders.status.${entry.value}`)
                : t('customerOrders.all')}{' '}
              (
              {entry.value
                ? (data?.statusCounts[entry.value] ?? 0)
                : (data?.totalOrders ?? 0)}
              )
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px_150px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label={t('customerOrders.search')}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t('customerOrders.searchPlaceholder')}
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-blue-500"
            />
          </label>
          <select
            aria-label={t('customerOrders.filterStatus')}
            value={filters.status ?? ''}
            onChange={(event) =>
              change({
                status: (event.target.value ||
                  undefined) as CustomerOrderFilters['status'],
              })
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="">{t('customerOrders.allStatuses')}</option>
            {Object.entries(orderStatuses).map(([value, { label }]) => (
              <option key={value} value={value}>
                {t(`customerOrders.status.${value}`, { defaultValue: label })}
              </option>
            ))}
          </select>
          <select
            aria-label={t('customerOrders.sort')}
            value={filters.sort}
            onChange={(event) =>
              change({
                sort: event.target.value as CustomerOrderFilters['sort'],
              })
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="NEWEST">{t('customerOrders.newest')}</option>
            <option value="OLDEST">{t('customerOrders.oldest')}</option>
          </select>
        </div>
        <div className="mt-4">
          {orders.isPending ? (
            <div className="rounded-xl border border-border p-14 text-center text-muted-foreground">
              {t('customerOrders.loading')}
            </div>
          ) : orders.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {t('customerOrders.loadError')}{' '}
              <button
                className="font-semibold underline"
                onClick={() => orders.refetch()}
              >
                {t('customerOrders.retry')}
              </button>
            </div>
          ) : rows.length ? (
            <CustomerOrdersTable rows={rows} />
          ) : (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-12 text-center dark:border-blue-800 dark:bg-blue-950/20">
              <ClipboardList className="mx-auto text-blue-500" size={38} />
              <h2 className="mt-3 text-lg font-bold">
                {data?.totalOrders
                  ? t('customerOrders.noMatches')
                  : t('customerOrders.noOrders')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.totalOrders
                  ? t('customerOrders.noMatchesHint')
                  : t('customerOrders.noOrdersHint')}
              </p>
              {!data?.totalOrders && (
                <Link
                  to="/customer/dashboard/buy"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  {t('customerOrders.explore')}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {t('customerOrders.pagination', {
              first,
              last,
              total: data?.meta.total ?? 0,
            })}
          </span>
          <div className="flex items-center gap-1">
            <button
              aria-label={t('customerOrders.previousPage')}
              disabled={!data?.meta.hasPrevious}
              onClick={() => change({ page: filters.page - 1 })}
              className="rounded-lg border border-border p-2 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="min-w-14 rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white">
              {filters.page} / {Math.max(1, data?.meta.totalPages ?? 1)}
            </span>
            <button
              aria-label={t('customerOrders.nextPage')}
              disabled={!data?.meta.hasNext}
              onClick={() => change({ page: filters.page + 1 })}
              className="rounded-lg border border-border p-2 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
            <button
              aria-label={t('customerOrders.refresh')}
              onClick={() => orders.refetch()}
              className="ml-2 rounded-lg border border-border p-2 text-blue-600 dark:text-blue-300"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
