import { Link } from '@tanstack/react-router'
import { ArrowLeft, Copy, LoaderCircle, PackageCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminOrderDetail } from '../../hooks/useAdminOrders'
import { StatusBadge, useOrderFormat } from './components/DetailShared'
import {
  CustomerCard,
  OrderInfoCard,
  PaymentCard,
} from './components/OrderSummaryCards'
import {
  HistoryCard,
  QuickActionsCard,
  ServiceCard,
} from './components/ServiceAndHistory'
import { UpdateOrderCard } from './components/UpdateOrderCard'

export default function AdminOrderDetailPage({ id }: { id: string }) {
  const { t } = useTranslation('adminOrders')
  const { date } = useOrderFormat()
  const query = useAdminOrderDetail(id)
  if (query.isPending)
    return (
      <div
        role="status"
        className="flex items-center gap-2 rounded-xl bg-white p-10 text-blue-600"
      >
        <LoaderCircle size={20} className="animate-spin" />
        {t('detail.loading')}
      </div>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl bg-white p-8">
        <p className="text-rose-600">
          {t('detail.loadFailed')}: {query.error.message}
        </p>
        <Link
          to="/admin/dashboard/orders"
          className="mt-4 inline-block text-blue-600 underline"
        >
          {t('detail.back')}
        </Link>
      </div>
    )
  const order = query.data
  return (
    <div className="min-w-0 space-y-5 pb-8 text-[#11184c]">
      <header className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-5 shadow-sm sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-blue-200/30 blur-3xl"
        />
        <p className="mb-3 text-sm text-slate-500">
          {t('breadcrumb')} / {order.orderNumber}
        </p>
        <div className="relative flex flex-wrap items-center gap-3">
          <Link
            to="/admin/dashboard/orders"
            aria-label={t('detail.back')}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft size={21} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('detail.order')} #{order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={() =>
                  void navigator.clipboard.writeText(order.orderNumber)
                }
                title={t('copyOrderNumber')}
                aria-label={t('copyOrderNumber')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy size={18} />
              </button>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {t('detail.createdAt')}: {date(order.createdAt)} ·{' '}
              {t('detail.updatedAt')}: {date(order.updatedAt)}
            </p>
          </div>
          <span className="hidden size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 sm:flex">
            <PackageCheck size={28} />
          </span>
        </div>
      </header>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(310px,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <CustomerCard order={order} />
            <OrderInfoCard order={order} />
          </div>
          <ServiceCard order={order} />
          <HistoryCard order={order} />
        </div>
        <aside className="space-y-4">
          <UpdateOrderCard
            key={`${order.id}:${order.status}:${order.paymentMethod}`}
            order={order}
          />
          <PaymentCard order={order} />
          <QuickActionsCard order={order} />
        </aside>
      </div>
    </div>
  )
}
