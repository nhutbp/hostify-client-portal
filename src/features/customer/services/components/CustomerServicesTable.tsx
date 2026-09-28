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

type Row = Awaited<
  ReturnType<typeof customerServicesService.list>
>['items'][number]

const categoryStyle: Record<
  string,
  { icon: typeof Server; badge: string; tile: string }
> = {
  vps: {
    icon: Server,
    badge: 'bg-blue-100 text-blue-700',
    tile: 'bg-blue-50 text-blue-600',
  },
  hosting: {
    icon: Globe2,
    badge: 'bg-sky-100 text-sky-700',
    tile: 'bg-sky-50 text-sky-600',
  },
  physical: {
    icon: HardDrive,
    badge: 'bg-violet-100 text-violet-700',
    tile: 'bg-violet-50 text-violet-600',
  },
  proxy: {
    icon: Link2,
    badge: 'bg-orange-100 text-orange-700',
    tile: 'bg-orange-50 text-orange-600',
  },
  via: {
    icon: UserRound,
    badge: 'bg-pink-100 text-pink-700',
    tile: 'bg-pink-50 text-pink-600',
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
  const allSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id))
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-[#26365e]">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                aria-label="Chọn tất cả dịch vụ trên trang"
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
              />
            </th>
            <th className="min-w-52 px-3 py-3">Dịch vụ</th>
            <th className="min-w-40 px-3 py-3">Thông tin</th>
            <th className="min-w-32 px-3 py-3">Nhà cung cấp</th>
            <th className="min-w-36 px-3 py-3">Thanh toán</th>
            <th className="min-w-36 px-3 py-3">Trạng thái</th>
            <th className="min-w-32 px-3 py-3">Thời hạn</th>
            <th className="w-32 px-3 py-3">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const style = categoryStyle[row.category.slug] ?? {
              icon: Package,
              badge: 'bg-slate-100 text-slate-700',
              tile: 'bg-slate-50 text-slate-600',
            }
            const Icon = style.icon
            const status = serviceStatusPresentation(
              row.status,
              row.daysRemaining,
            )
            return (
              <tr
                key={row.id}
                className="bg-white transition hover:bg-blue-50/40"
              >
                <td className="px-4 py-3">
                  <input
                    aria-label={`Chọn ${row.productName}`}
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
                        className="font-semibold text-[#101746] hover:text-blue-600"
                      >
                        {row.productName}
                      </Link>
                      <p className="truncate text-xs text-slate-500">
                        {row.serviceCode}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${style.badge}`}
                      >
                        {row.category.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">
                  <p className="font-medium text-[#26365e]">
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
                      className="max-w-32 truncate text-xs text-slate-500"
                      title={row.operatingSystem}
                    >
                      {row.operatingSystem}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-blue-600">
                    {formatServicePrice(
                      row.amountMinor,
                      row.currency,
                      row.billingCycle,
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.amountMinor === null
                      ? 'Chưa có giá đơn hàng'
                      : 'Giá khi mua'}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}
                  >
                    <span className={`size-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">
                    {formatServiceDate(row.expiresAt)}
                  </p>
                  {row.daysRemaining !== null && (
                    <p className="text-xs text-slate-500">
                      {row.daysRemaining > 0
                        ? `Còn ${row.daysRemaining} ngày`
                        : 'Đã tới hạn'}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center">
                    <Link
                      to="/customer/dashboard/services/$id"
                      params={{ id: row.id }}
                      className="rounded-l-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Quản lý
                    </Link>
                    <details className="relative">
                      <summary className="flex h-[38px] cursor-pointer list-none items-center rounded-r-lg border border-l-0 border-blue-200 px-2 text-blue-600">
                        <ChevronDown size={14} />
                      </summary>
                      <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        <Link
                          to="/customer/dashboard/services/$id"
                          params={{ id: row.id }}
                          className="block rounded px-2 py-1.5 hover:bg-blue-50"
                        >
                          Xem chi tiết
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
