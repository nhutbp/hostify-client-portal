import { useEffect, useState } from 'react'
import { Download, RotateCcw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminOrders } from '../hooks/useAdminOrders'
import type { AdminOrderFilters } from '../services/adminOrderService'
import { AdminOrdersTable } from './components/AdminOrdersTable'
import Pagination from '@/components/table/Pagination'

const tabs = [
  'ALL',
  'PENDING_PAYMENT',
  'PAID',
  'PROVISIONING',
  'COMPLETED',
  'CANCELLED',
] as const
const initialFilters: AdminOrderFilters = { page: 1, limit: 8, sort: 'NEWEST' }

export default function AdminOrdersPage() {
  const { t } = useTranslation('adminOrders')
  const [filters, setFilters] = useState<AdminOrderFilters>(initialFilters)
  const [search, setSearch] = useState('')
  const orders = useAdminOrders(filters)
  const data = orders.data
  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setFilters((current) => ({
          ...current,
          search: search.trim() || undefined,
          page: 1,
        })),
      300,
    )
    return () => window.clearTimeout(timer)
  }, [search])
  const change = (patch: Partial<AdminOrderFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }))
  const exportPage = () => {
    if (!data?.items.length) return
    const cell = (value: string | number) => {
      const content = String(value)
      const safe = /^[=+@\-\t\r]/.test(content) ? `'${content}` : content
      return `"${safe.replaceAll('"', '""')}"`
    }
    const rows = data.items.map((order) => [
      order.orderNumber,
      order.customer.name,
      order.customer.email,
      order.items.map((item) => item.productName).join('; '),
      order.items.map((item) => item.providerName ?? '').join('; '),
      order.totalMinor,
      order.currency,
      t(`statuses.${order.status}`),
      order.createdAt,
    ])
    const csv =
      '\uFEFF' +
      [
        [
          t('orderNumber'),
          t('customer'),
          'Email',
          t('service'),
          t('provider'),
          t('value'),
          'Currency',
          t('status'),
          t('createdAt'),
        ],
        ...rows,
      ]
        .map((row) => row.map(cell).join(','))
        .join('\r\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-page-${filters.page}.csv`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  return (
    <div className="min-w-0 space-y-5 text-[#11184c]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{t('breadcrumb')}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-1 text-base text-slate-500">{t('description')}</p>
        </div>
        <button
          type="button"
          onClick={exportPage}
          disabled={!data?.items.length}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Download size={16} />
          {t('exportPage')}
        </button>
      </header>
      <section className="min-w-0 space-y-5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                change({ status: tab === 'ALL' ? undefined : tab })
              }
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ${filters.status === (tab === 'ALL' ? undefined : tab) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}
            >
              {t(`tabs.${tab}`)} (
              {tab === 'ALL'
                ? (data?.totalOrders ?? 0)
                : (data?.statusCounts[tab] ?? 0)}
              )
            </button>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_150px_150px_160px_150px_150px_auto]">
          <label className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <select
            aria-label={t('service')}
            value={filters.categoryId ?? ''}
            onChange={(event) =>
              change({ categoryId: event.target.value || undefined })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">{t('allServices')}</option>
            {data?.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label={t('status')}
            value={filters.status ?? ''}
            onChange={(event) =>
              change({
                status: (event.target.value ||
                  undefined) as AdminOrderFilters['status'],
              })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">{t('allStatuses')}</option>
            {[
              'DRAFT',
              'PENDING_PAYMENT',
              'PAID',
              'PROVISIONING',
              'COMPLETED',
              'FAILED',
              'CANCELLED',
              'REFUNDED',
            ].map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status}`)}
              </option>
            ))}
          </select>
          <select
            aria-label={t('provider')}
            value={filters.providerCategoryId ?? ''}
            onChange={(event) =>
              change({ providerCategoryId: event.target.value || undefined })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">{t('allProviders')}</option>
            {data?.providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label={t('fromDate')}
            value={filters.dateFrom ?? ''}
            max={filters.dateTo}
            onChange={(event) =>
              change({ dateFrom: event.target.value || undefined })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm"
          />
          <input
            type="date"
            aria-label={t('toDate')}
            value={filters.dateTo ?? ''}
            min={filters.dateFrom}
            onChange={(event) =>
              change({ dateTo: event.target.value || undefined })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm"
          />
          <button
            type="button"
            title={t('reset')}
            onClick={() => {
              setSearch('')
              setFilters(initialFilters)
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw size={16} />
            {t('reset')}
          </button>
        </div>
        <div className="flex justify-end">
          <select
            aria-label={t('sort')}
            value={filters.sort}
            onChange={(event) =>
              change({ sort: event.target.value as AdminOrderFilters['sort'] })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="NEWEST">{t('newest')}</option>
            <option value="OLDEST">{t('oldest')}</option>
            <option value="TOTAL_DESC">{t('highestValue')}</option>
            <option value="TOTAL_ASC">{t('lowestValue')}</option>
          </select>
        </div>
        {orders.isPending && (
          <p className="py-12 text-center text-slate-500">{t('loading')}</p>
        )}
        {orders.isError && (
          <p role="alert" className="py-12 text-center text-red-600">
            {t('loadFailed')}: {orders.error.message}{' '}
            <button
              type="button"
              onClick={() => void orders.refetch()}
              className="ml-2 underline"
            >
              {t('retry')}
            </button>
          </p>
        )}
        {data && (
          <>
            <AdminOrdersTable data={data} />
            <Pagination
              pagination={data.meta}
              displayedCount={data.items.length}
              onPageChange={(page) => change({ page })}
              onPageSizeChange={(limit) => change({ limit })}
              pageSizeOptions={[8, 10, 20, 50]}
            />
          </>
        )}
      </section>
    </div>
  )
}
