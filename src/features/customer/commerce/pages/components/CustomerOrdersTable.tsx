import { Link } from '@tanstack/react-router'
import type { customerOrderService } from '../../services/customerOrderService'
import {
  orderDate,
  orderMoney,
  orderStatus,
  paymentMethodLabels,
} from '../../utils/orderDisplay'

type OrderRow = Awaited<
  ReturnType<typeof customerOrderService.list>
>['items'][number]

export function CustomerOrdersTable({ rows }: { rows: OrderRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[930px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-[#26365e]">
          <tr>
            <th className="px-4 py-3">Mã đơn hàng</th>
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">Ngày đặt</th>
            <th className="px-4 py-3">Thanh toán</th>
            <th className="px-4 py-3">Tổng tiền</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((order) => {
            const status = orderStatus(order.status)
            return (
              <tr
                key={order.id}
                className="bg-white transition hover:bg-blue-50/40"
              >
                <td className="px-4 py-4">
                  <Link
                    to="/customer/dashboard/orders/$id"
                    params={{ id: order.id }}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {order.itemCount} sản phẩm
                  </p>
                </td>
                <td className="max-w-64 px-4 py-4">
                  <p
                    className="truncate font-medium"
                    title={order.items
                      .map((item) => item.productName)
                      .join(', ')}
                  >
                    {order.items[0]?.productName ?? '—'}
                    {order.items.length > 1 &&
                      ` +${order.items.length - 1} gói`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.items[0]?.categoryName ?? '—'}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {orderDate(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  {order.paymentMethod
                    ? (paymentMethodLabels[order.paymentMethod] ??
                      order.paymentMethod)
                    : '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-blue-600">
                  {orderMoney(order.totalMinor, order.currency)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    <span className={`size-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Link
                    to="/customer/dashboard/orders/$id"
                    params={{ id: order.id }}
                    className="rounded-lg border border-blue-200 px-3 py-2 font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Chi tiết
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
