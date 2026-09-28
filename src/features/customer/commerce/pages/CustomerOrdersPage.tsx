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

const initialFilters: CustomerOrderFilters = {
  page: 1,
  limit: 10,
  sort: 'NEWEST',
}
const featuredStatuses = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const

export default function CustomerOrdersPage() {
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
    <div className="mx-auto max-w-[1500px] space-y-4 text-[#101746]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div>
          <p className="text-sm text-slate-500">Trang chủ / Lịch sử mua hàng</p>
          <h1 className="mt-1 text-3xl font-bold">Lịch sử mua hàng</h1>
          <p className="mt-1 text-slate-500">
            Theo dõi đơn hàng, thanh toán và trạng thái xử lý
          </p>
        </div>
        <Link
          to="/customer/dashboard/buy"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} /> Mua thêm dịch vụ
        </Link>
      </div>
      <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
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
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ${filters.status === (entry.value || undefined) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-[#26365e] hover:border-blue-300'}`}
            >
              {entry.label} (
              {entry.value
                ? (data?.statusCounts[entry.value] ?? 0)
                : (data?.totalOrders ?? 0)}
              )
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px_150px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              aria-label="Tìm đơn hàng"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm mã đơn hoặc tên sản phẩm..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <select
            aria-label="Lọc trạng thái đơn hàng"
            value={filters.status ?? ''}
            onChange={(event) =>
              change({
                status: (event.target.value ||
                  undefined) as CustomerOrderFilters['status'],
              })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(orderStatuses).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sắp xếp đơn hàng"
            value={filters.sort}
            onChange={(event) =>
              change({
                sort: event.target.value as CustomerOrderFilters['sort'],
              })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="NEWEST">Mới nhất</option>
            <option value="OLDEST">Cũ nhất</option>
          </select>
        </div>
        <div className="mt-4">
          {orders.isPending ? (
            <div className="rounded-xl border border-slate-200 p-14 text-center text-slate-500">
              Đang tải đơn hàng...
            </div>
          ) : orders.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
              Không thể tải lịch sử mua hàng.{' '}
              <button
                className="font-semibold underline"
                onClick={() => orders.refetch()}
              >
                Thử lại
              </button>
            </div>
          ) : rows.length ? (
            <CustomerOrdersTable rows={rows} />
          ) : (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-12 text-center">
              <ClipboardList className="mx-auto text-blue-500" size={38} />
              <h2 className="mt-3 text-lg font-bold">
                {data?.totalOrders
                  ? 'Không tìm thấy đơn phù hợp'
                  : 'Bạn chưa có đơn hàng nào'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {data?.totalOrders
                  ? 'Thử thay đổi trạng thái hoặc từ khóa tìm kiếm.'
                  : 'Các đơn đã đặt sẽ xuất hiện tại đây, kể cả khi đang chờ thanh toán.'}
              </p>
              {!data?.totalOrders && (
                <Link
                  to="/customer/dashboard/buy"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Khám phá dịch vụ
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            Hiển thị {first} - {last} của {data?.meta.total ?? 0} đơn hàng
          </span>
          <div className="flex items-center gap-1">
            <button
              aria-label="Trang trước"
              disabled={!data?.meta.hasPrevious}
              onClick={() => change({ page: filters.page - 1 })}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="min-w-14 rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white">
              {filters.page} / {Math.max(1, data?.meta.totalPages ?? 1)}
            </span>
            <button
              aria-label="Trang sau"
              disabled={!data?.meta.hasNext}
              onClick={() => change({ page: filters.page + 1 })}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
            <button
              aria-label="Làm mới lịch sử"
              onClick={() => orders.refetch()}
              className="ml-2 rounded-lg border border-slate-200 p-2 text-blue-600"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
