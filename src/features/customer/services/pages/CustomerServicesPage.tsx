import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Headphones,
  Plus,
  RefreshCw,
  Server,
} from 'lucide-react'
import { CustomerServicesFilters } from '../components/CustomerServicesFilters'
import { CustomerServicesTable } from '../components/CustomerServicesTable'
import { useCustomerServices } from '../hooks/useCustomerServices'
import type { CustomerServicesFilters as Filters } from '../services/customerServicesService'

const initialFilters: Filters = { page: 1, limit: 6, sort: 'NEWEST' }

export default function CustomerServicesPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const services = useCustomerServices(filters)
  const data = services.data

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

  function change(patch: Partial<Filters>) {
    setSelected(new Set())
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
          <p className="text-sm text-slate-500">Trang chủ / Quản lý dịch vụ</p>
          <h1 className="mt-1 text-3xl font-bold">Quản lý dịch vụ</h1>
          <p className="mt-1 text-slate-500">
            Xem và quản lý tất cả dịch vụ bạn đã mua
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
        <CustomerServicesFilters
          filters={filters}
          categories={data?.categories ?? []}
          providers={data?.providers ?? []}
          total={data?.totalServices ?? 0}
          searchText={searchText}
          onSearchText={setSearchText}
          onChange={change}
        />
        <div className="mt-4">
          {services.isPending ? (
            <div className="rounded-xl border border-slate-200 p-16 text-center text-slate-500">
              Đang tải dịch vụ...
            </div>
          ) : services.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
              Không thể tải dịch vụ.{' '}
              <button
                className="font-semibold underline"
                onClick={() => services.refetch()}
              >
                Thử lại
              </button>
            </div>
          ) : rows.length ? (
            <CustomerServicesTable
              rows={rows}
              selected={selected}
              onSelect={(id) =>
                setSelected((current) => {
                  const next = new Set(current)
                  if (next.has(id)) next.delete(id)
                  else next.add(id)
                  return next
                })
              }
              onSelectAll={() =>
                setSelected((current) => {
                  const next = new Set(current)
                  if (rows.every((row) => next.has(row.id)))
                    rows.forEach((row) => next.delete(row.id))
                  else rows.forEach((row) => next.add(row.id))
                  return next
                })
              }
            />
          ) : (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-12 text-center">
              <Server className="mx-auto text-blue-500" size={38} />
              <h2 className="mt-3 text-lg font-bold">
                {data?.totalServices
                  ? 'Không tìm thấy dịch vụ phù hợp'
                  : 'Bạn chưa có dịch vụ nào'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {data?.totalServices
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Dịch vụ sẽ xuất hiện tại đây sau khi đơn hàng được thanh toán và cấp phát.'}
              </p>
              {!data?.totalServices && (
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
          <div className="flex items-center gap-3">
            <span>
              Hiển thị {first} - {last} của {data?.meta.total ?? 0} dịch vụ
            </span>
            {selected.size > 0 && (
              <button
                className="font-medium text-blue-600"
                onClick={() => setSelected(new Set())}
              >
                Đã chọn {selected.size} · Bỏ chọn
              </button>
            )}
          </div>
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
              aria-label="Làm mới danh sách"
              onClick={() => services.refetch()}
              className="ml-2 rounded-lg border border-slate-200 p-2 text-blue-600"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white">
            <CircleHelp size={23} />
          </span>
          <div>
            <strong>Cần hỗ trợ quản lý dịch vụ?</strong>
            <p className="text-sm text-slate-500">
              Bạn có thể theo dõi trạng thái, thời hạn và lịch sử của dịch vụ
              tại trang chi tiết.
            </p>
          </div>
        </div>
        <button
          disabled
          title="Kênh hỗ trợ trực tuyến đang được hoàn thiện"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 opacity-60"
        >
          <Headphones size={17} /> Liên hệ hỗ trợ
        </button>
      </section>
    </div>
  )
}
