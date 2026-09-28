import { Link } from '@tanstack/react-router'
import { Server, ShoppingCart } from 'lucide-react'
import type { CustomerPackage } from '../types/customerCatalog'
import { cycleLabels, money } from '../types/customerCatalog'

export function CustomerOrderSummary({
  item,
  cycle,
  locationId,
  onLocationChange,
  onAdd,
  pending,
}: {
  item?: CustomerPackage
  cycle: string
  locationId: string
  onLocationChange: (id: string) => void
  onAdd: () => void
  pending: boolean
}) {
  const price = item?.prices[cycle]
  const setupFee = item?.setupFees[cycle] ?? 0
  const locationRequired = Boolean(item?.locations.length)
  const canAdd = Boolean(
    item && price !== undefined && (!locationRequired || locationId),
  )
  return (
    <aside className="h-fit rounded-xl bg-white p-5 shadow-sm">
      <h2 className="border-b border-slate-100 pb-3 text-lg font-bold">
        Tổng quan đơn hàng
      </h2>
      {item && price !== undefined ? (
        <>
          <div className="flex gap-3 border-b border-slate-100 py-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Server />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex justify-between gap-2 font-bold">
                <span className="truncate">{item.name}</span>
                <span className="whitespace-nowrap text-blue-600">
                  {money(price)}
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                Chu kỳ: {cycleLabels[cycle] ?? cycle}
              </p>
              {item.features.cpu > 0 && (
                <p className="text-slate-500">
                  {item.features.cpu} vCPU · {item.features.ramGb} GB RAM ·{' '}
                  {item.features.diskGb} GB {item.features.diskType}
                </p>
              )}
            </div>
          </div>
          {locationRequired && (
            <label className="mt-4 block text-sm font-medium">
              Vị trí datacenter
              <select
                value={locationId}
                onChange={(event) => onLocationChange(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3"
              >
                <option value="">Chọn vị trí</option>
                {item.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                    {location.city ? ` · ${location.city}` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="mt-4 space-y-2 border-t border-slate-100 py-3 text-sm">
            <div className="flex justify-between">
              <span>Giá gói</span>
              <span>{money(price)}</span>
            </div>
            {setupFee > 0 && (
              <div className="flex justify-between">
                <span>Phí cài đặt</span>
                <span>{money(setupFee)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2 border-t border-slate-100 py-4 font-bold">
            <span>Tạm tính</span>
            <span className="text-xl text-blue-600">
              {money(price + setupFee)}
            </span>
          </div>
          <button
            type="button"
            disabled={!canAdd || pending}
            onClick={onAdd}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <ShoppingCart size={18} />
            {pending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Thuế, khuyến mãi và tổng thanh toán được xác nhận khi checkout. Chưa
            tạo đơn hàng hoặc thu tiền ở bước này.
          </p>
        </>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          Chọn một gói dịch vụ để xem chi phí.
        </p>
      )}
      <Link
        to="/customer/dashboard/cart"
        className="mt-4 block text-center text-sm font-semibold text-blue-600"
      >
        Xem giỏ hàng →
      </Link>
    </aside>
  )
}
