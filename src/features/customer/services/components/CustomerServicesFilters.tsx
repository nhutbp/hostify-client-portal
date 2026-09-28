import { Search } from 'lucide-react'
import type { CustomerServicesFilters } from '../services/customerServicesService'

type Category = { slug: string; name: string; count: number }
type Provider = { id: string; name: string }

export function CustomerServicesFilters({
  filters,
  categories,
  providers,
  total,
  searchText,
  onSearchText,
  onChange,
}: {
  filters: CustomerServicesFilters
  categories: Category[]
  providers: Provider[]
  total: number
  searchText: string
  onSearchText: (value: string) => void
  onChange: (patch: Partial<CustomerServicesFilters>) => void
}) {
  const selectClass =
    'h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#26365e] outline-none focus:border-blue-500'
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onChange({ category: undefined })}
          className={`shrink-0 rounded-lg border px-5 py-2 text-sm font-semibold ${!filters.category ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-[#26365e] hover:border-blue-300'}`}
        >
          Tất cả ({total})
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => onChange({ category: category.slug })}
            className={`shrink-0 rounded-lg border px-5 py-2 text-sm font-semibold ${filters.category === category.slug ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-[#26365e] hover:border-blue-300'}`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.7fr)_repeat(3,minmax(140px,1fr))_130px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            aria-label="Tìm kiếm dịch vụ"
            value={searchText}
            onChange={(event) => onSearchText(event.target.value)}
            placeholder="Tìm dịch vụ, mã, tên miền, IP..."
            className={`${selectClass} w-full pl-9`}
          />
        </label>
        <select
          aria-label="Loại dịch vụ"
          value={filters.category ?? ''}
          onChange={(event) =>
            onChange({ category: event.target.value || undefined })
          }
          className={selectClass}
        >
          <option value="">Tất cả loại dịch vụ</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Trạng thái dịch vụ"
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({
              status: (event.target.value ||
                undefined) as CustomerServicesFilters['status'],
            })
          }
          className={selectClass}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="PENDING">Chờ kích hoạt</option>
          <option value="PROVISIONING">Đang cấp phát</option>
          <option value="SUSPENDED">Tạm ngưng</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="ERROR">Có lỗi</option>
          <option value="TERMINATED">Đã chấm dứt</option>
        </select>
        <select
          aria-label="Nhà cung cấp"
          value={filters.providerId ?? ''}
          onChange={(event) =>
            onChange({ providerId: event.target.value || undefined })
          }
          className={selectClass}
        >
          <option value="">Tất cả nhà cung cấp</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Sắp xếp"
          value={filters.sort}
          onChange={(event) =>
            onChange({
              sort: event.target.value as CustomerServicesFilters['sort'],
            })
          }
          className={selectClass}
        >
          <option value="NEWEST">Mới nhất</option>
          <option value="OLDEST">Cũ nhất</option>
          <option value="EXPIRING">Sắp hết hạn</option>
        </select>
      </div>
    </div>
  )
}
