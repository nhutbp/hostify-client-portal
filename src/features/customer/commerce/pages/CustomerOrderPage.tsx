import { Link, useParams } from '@tanstack/react-router'
import { useCustomerOrder } from '../hooks/useCustomerOrder'
import {
  orderDate,
  orderMoney,
  orderStatus,
  paymentMethodLabels,
} from '../utils/orderDisplay'

export default function CustomerOrderPage() {
  const { id } = useParams({
    from: '/_dashboard/customer/dashboard/orders/$id',
  })
  const order = useCustomerOrder(id)
  if (order.isPending)
    return <div className="rounded-xl bg-white p-10">Đang tải đơn hàng...</div>
  if (!order.data)
    return (
      <div className="rounded-xl bg-white p-10 text-red-600">
        Không thể tải đơn hàng.
      </div>
    )
  const data = order.data
  const status = orderStatus(data.status)
  return (
    <div className="mx-auto max-w-4xl space-y-5 text-[#101746]">
      <div>
        <Link to="/customer/dashboard/orders" className="text-sm text-blue-600">
          ← Lịch sử mua hàng
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Chi tiết đơn hàng</h1>
        <p className="mt-2 text-slate-600">
          Theo dõi sản phẩm, số tiền và trạng thái xử lý đơn hàng.
        </p>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Mã đơn hàng</p>
            <strong className="text-xl">{data.orderNumber}</strong>
          </div>
          <span
            className={`h-fit rounded-full px-4 py-2 font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Đặt lúc {orderDate(data.createdAt)} · Phương thức:{' '}
          {data.paymentMethod
            ? (paymentMethodLabels[data.paymentMethod] ?? data.paymentMethod)
            : '—'}
        </p>
        <div className="mt-5 space-y-3 border-t pt-4">
          {data.items.map((item) => (
            <div className="flex justify-between gap-3" key={item.id}>
              <span>
                {item.productName} × {item.quantity}
              </span>
              <strong>{orderMoney(item.totalMinor, data.currency)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t pt-4">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{orderMoney(data.subtotalMinor, data.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá</span>
            <span>-{orderMoney(data.discountMinor, data.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế VAT</span>
            <span>{orderMoney(data.taxMinor, data.currency)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Tổng cộng</span>
            <span className="text-blue-600">
              {orderMoney(data.totalMinor, data.currency)}
            </span>
          </div>
        </div>
        {data.status === 'PENDING_PAYMENT' && (
          <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            Đơn đang chờ thanh toán. Cổng thanh toán chưa được kết nối; chưa có
            khoản tiền nào được thu và dịch vụ chưa được kích hoạt.
          </p>
        )}
      </div>
      <Link
        to="/customer/dashboard/buy"
        className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
      >
        Tiếp tục xem dịch vụ
      </Link>
    </div>
  )
}
