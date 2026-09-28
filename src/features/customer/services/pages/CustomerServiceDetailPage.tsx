import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, Server } from 'lucide-react'
import { useCustomerService } from '../hooks/useCustomerServices'
import {
  formatServiceDate,
  formatServicePrice,
  serviceStatusPresentation,
} from '../utils/serviceDisplay'

export default function CustomerServiceDetailPage() {
  const { id } = useParams({
    from: '/_dashboard/customer/dashboard/services/$id',
  })
  const service = useCustomerService(id)
  if (service.isPending)
    return (
      <div className="rounded-xl bg-white p-10 text-slate-500">
        Đang tải dịch vụ...
      </div>
    )
  if (!service.data)
    return (
      <div className="rounded-xl bg-white p-10 text-red-600">
        Không tìm thấy dịch vụ hoặc bạn không có quyền truy cập.
      </div>
    )
  const data = service.data
  const status = serviceStatusPresentation(data.status, data.daysRemaining)
  return (
    <div className="mx-auto max-w-5xl space-y-5 text-[#101746]">
      <div>
        <Link
          to="/customer/dashboard/services"
          className="inline-flex items-center gap-2 text-sm text-blue-600"
        >
          <ArrowLeft size={16} /> Quản lý dịch vụ
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{data.productName}</h1>
            <p className="text-slate-500">
              {data.serviceCode} · {data.category.name}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${status.className}`}
          >
            <span className={`size-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Server className="text-blue-600" size={20} /> Thông tin dịch vụ
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Gói dịch vụ', data.planName ?? '—'],
              ['Địa chỉ / tài nguyên', data.address ?? '—'],
              ['Nhà cung cấp', data.provider ?? '—'],
              ['Hệ điều hành', data.operatingSystem ?? '—'],
              ['Datacenter', data.datacenter ?? '—'],
              ...data.details.map((value, index) => [
                `Cấu hình ${index + 1}`,
                value,
              ]),
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-slate-100 pb-2"
              >
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <CalendarDays className="text-blue-600" size={20} /> Thanh toán và
            thời hạn
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              [
                'Giá khi mua',
                formatServicePrice(
                  data.amountMinor,
                  data.currency,
                  data.billingCycle,
                ),
              ],
              ['Ngày kích hoạt', formatServiceDate(data.activatedAt)],
              ['Ngày hết hạn', formatServiceDate(data.expiresAt)],
              [
                'Thời gian còn lại',
                data.daysRemaining === null
                  ? '—'
                  : data.daysRemaining > 0
                    ? `${data.daysRemaining} ngày`
                    : 'Đã tới hạn',
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-slate-100 pb-2"
              >
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            Các thao tác gia hạn, khởi động và thay đổi cấu hình sẽ được mở khi
            tích hợp hệ thống cấp phát dịch vụ.
          </p>
        </section>
      </div>
      {data.events.length > 0 && (
        <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Lịch sử dịch vụ</h2>
          <div className="divide-y divide-slate-100">
            {data.events.map((event) => (
              <div
                key={event.id}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {event.eventType}
                  {event.toStatus ? ` → ${event.toStatus}` : ''}
                </span>
                <time className="text-slate-500">
                  {formatServiceDate(event.createdAt)}
                </time>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
