import { Copy, Globe2, Link2, Package, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { adminOrderService } from '../../services/adminOrderService'

type Data = Awaited<ReturnType<typeof adminOrderService.list>>
const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  PAID: 'bg-sky-100 text-sky-700',
  PROVISIONING: 'bg-violet-100 text-violet-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  REFUNDED: 'bg-blue-100 text-blue-700',
}

function ProductIcon({ slug }: { slug: string }) {
  const Icon =
    slug === 'hosting' || slug === 'domain'
      ? Globe2
      : slug === 'proxy'
        ? Link2
        : slug === 'vps' || slug === 'physical'
          ? Server
          : Package
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon size={19} />
    </span>
  )
}

export function AdminOrdersTable({ data }: { data: Data }) {
  const { t, i18n } = useTranslation('adminOrders')
  const money = (value: number, currency: string) =>
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value))
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {[
              'orderNumber',
              'customer',
              'service',
              'provider',
              'value',
              'status',
              'createdAt',
              'actions',
            ].map((key) => (
              <th key={key} className="px-4 py-3 font-semibold">
                {t(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.items.map((order) => {
            const first = order.items[0]
            return (
              <tr key={order.id} className="hover:bg-blue-50/40">
                <td className="px-4 py-4 font-semibold text-[#11184c]">
                  <Link
                    to="/admin/dashboard/orders/$id"
                    params={{ id: order.id }}
                    className="hover:text-blue-600 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <span className="block font-medium text-[#11184c]">
                    {order.customer.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {order.customer.email}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {first && <ProductIcon slug={first.categorySlug} />}
                    <div>
                      <span className="block font-medium text-[#11184c]">
                        {first?.productName ?? '—'}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {first?.categoryName ?? '—'}
                        {order.items.length > 1
                          ? ` +${order.items.length - 1}`
                          : ''}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {first?.providerName ?? '—'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-semibold text-[#11184c]">
                  {money(order.totalMinor, order.currency)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusColors[order.status] ?? statusColors.DRAFT}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {t(`statuses.${order.status}`, {
                      defaultValue: order.status,
                    })}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                  {date(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Link
                      to="/admin/dashboard/orders/$id"
                      params={{ id: order.id }}
                      className="rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      {t('viewDetail')}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard.writeText(order.orderNumber)
                      }
                      className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 text-blue-600 hover:bg-blue-50"
                      title={t('copyOrderNumber')}
                      aria-label={`${t('copyOrderNumber')} ${order.orderNumber}`}
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {!data.items.length && (
            <tr>
              <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                {t('empty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
