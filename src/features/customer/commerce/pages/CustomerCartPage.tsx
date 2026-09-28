import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Headphones,
  Minus,
  Plus,
  Server,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { toast } from '@/utils/toast'
import { VpsOperatingSystemSelect } from '../components/VpsOperatingSystemSelect'
import {
  cycleLabels,
  money,
} from '@/features/customer/catalog/types/customerCatalog'
import {
  useApplyCustomerCoupon,
  useClearCustomerCart,
  useCustomerCart,
  useRemoveCustomerCartItem,
  useRemoveCustomerCoupon,
  useUpdateCustomerCartItem,
} from '../hooks/useCustomerCart'

export default function CustomerCartPage() {
  const cart = useCustomerCart()
  const update = useUpdateCustomerCartItem()
  const remove = useRemoveCustomerCartItem()
  const clear = useClearCustomerCart()
  const applyCoupon = useApplyCustomerCoupon()
  const removeCoupon = useRemoveCustomerCoupon()
  const [code, setCode] = useState('')
  const data = cart.data
  async function act(action: () => Promise<unknown>, success: string) {
    try {
      await action()
      toast.success(success)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể thực hiện thao tác',
      )
    }
  }
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 text-[#101746]">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-5 py-4">
        <div>
          <p className="text-sm text-slate-500">Mua dịch vụ / Giỏ hàng</p>
          <h1 className="mt-1 text-3xl font-bold">Giỏ hàng</h1>
          <p className="text-slate-500">
            Kiểm tra các dịch vụ bạn đã chọn trước khi thanh toán
          </p>
        </div>
        <Link
          to="/customer/dashboard/buy"
          className="rounded-lg border border-blue-200 bg-white px-4 py-2 font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
        >
          ＋ Tiếp tục mua sắm
        </Link>
      </div>
      {cart.isPending ? (
        <div className="rounded-xl bg-white p-10">Đang tải giỏ hàng...</div>
      ) : cart.isError ? (
        <div className="rounded-xl bg-white p-10 text-red-600">
          Không thể tải giỏ hàng.{' '}
          <button onClick={() => cart.refetch()}>Thử lại</button>
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-xl bg-white p-12 text-center">
          <ShoppingCart className="mx-auto text-blue-600" size={42} />
          <h2 className="mt-3 text-xl font-bold">Giỏ hàng đang trống</h2>
          <Link
            to="/customer/dashboard/buy"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Chọn dịch vụ
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <ShoppingCart size={19} /> Sản phẩm trong giỏ hàng ({data.count})
            </h2>
            <div className="space-y-3">
              {data.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 p-4 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Server size={30} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <h3 className="font-bold">
                          {item.productName}{' '}
                          {item.featured && (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                              Phổ biến
                            </span>
                          )}
                        </h3>
                        <strong className="text-blue-600">
                          {item.totalMinor === null
                            ? 'Không khả dụng'
                            : money(item.totalMinor)}
                        </strong>
                      </div>
                      <p className="text-sm text-slate-500">
                        {item.description || item.planName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-blue-50/70 px-3 py-2 text-sm text-[#26365e]">
                        {item.features.cpu > 0 && (
                          <span>{item.features.cpu} vCPU</span>
                        )}
                        {item.features.ramGb > 0 && (
                          <span>{item.features.ramGb} GB RAM</span>
                        )}
                        {item.features.diskGb > 0 && (
                          <span>
                            {item.features.diskGb} GB {item.features.diskType}
                          </span>
                        )}
                        {item.features.bandwidth && (
                          <span>{item.features.bandwidth} băng thông</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!item.available && (
                    <p className="mt-3 text-sm text-red-600">
                      Gói, giá hoặc datacenter không còn khả dụng. Vui lòng chọn
                      lại.
                    </p>
                  )}
                  <div className="mt-3 grid items-end gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                    <label className="text-sm font-semibold">
                      Chu kỳ thanh toán
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 font-normal"
                        value={item.billingCycle}
                        onChange={(event) =>
                          act(
                            () =>
                              update.mutateAsync({
                                id: item.id,
                                quantity: item.quantity,
                                billingCycle: event.target.value,
                                datacenterId: item.datacenterId,
                              }),
                            'Đã cập nhật chu kỳ',
                          )
                        }
                        disabled={update.isPending}
                      >
                        {item.availableCycles.map((cycle) => (
                          <option
                            key={cycle.billingCycle}
                            value={cycle.billingCycle}
                          >
                            {cycleLabels[cycle.billingCycle] ??
                              cycle.billingCycle}{' '}
                            - {money(cycle.amountMinor)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {item.locations.length > 0 ? (
                      <label className="text-sm font-semibold">
                        Vị trí Datacenter
                        <select
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 font-normal"
                          value={item.datacenterId ?? ''}
                          onChange={(event) =>
                            act(
                              () =>
                                update.mutateAsync({
                                  id: item.id,
                                  quantity: item.quantity,
                                  billingCycle: item.billingCycle,
                                  datacenterId: event.target.value,
                                }),
                              'Đã cập nhật vị trí',
                            )
                          }
                          disabled={update.isPending}
                        >
                          {item.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <div />
                    )}
                    <div className="text-sm font-semibold">
                      Số lượng
                      <div className="mt-1 flex h-[42px] items-center rounded-lg border border-slate-200">
                        <button
                          className="px-2"
                          aria-label="Giảm số lượng"
                          disabled={item.quantity <= 1 || update.isPending}
                          onClick={() =>
                            act(
                              () =>
                                update.mutateAsync({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                  billingCycle: item.billingCycle,
                                  datacenterId: item.datacenterId,
                                }),
                              'Đã cập nhật số lượng',
                            )
                          }
                        >
                          <Minus size={15} />
                        </button>
                        <span className="min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2"
                          aria-label="Tăng số lượng"
                          disabled={item.quantity >= 100 || update.isPending}
                          onClick={() =>
                            act(
                              () =>
                                update.mutateAsync({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                  billingCycle: item.billingCycle,
                                  datacenterId: item.datacenterId,
                                }),
                              'Đã cập nhật số lượng',
                            )
                          }
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="mb-2 text-slate-500 hover:text-red-600"
                      aria-label="Xóa gói"
                      disabled={remove.isPending}
                      onClick={() =>
                        act(() => remove.mutateAsync(item.id), 'Đã xóa gói')
                      }
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                  {item.categorySlug === 'vps' && (
                    <div className="mt-3 max-w-md">
                      <VpsOperatingSystemSelect
                        value={item.operatingSystem}
                        options={item.availableOperatingSystems}
                        disabled={update.isPending}
                        onChange={(operatingSystem) =>
                          act(
                            () =>
                              update.mutateAsync({
                                id: item.id,
                                quantity: item.quantity,
                                billingCycle: item.billingCycle,
                                datacenterId: item.datacenterId,
                                operatingSystem,
                              }),
                            'Đã cập nhật hệ điều hành',
                          )
                        }
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                className="rounded-lg border border-red-200 px-4 py-2 text-red-600"
                disabled={clear.isPending}
                onClick={() => {
                  if (window.confirm('Xóa tất cả sản phẩm khỏi giỏ hàng?'))
                    act(() => clear.mutateAsync(), 'Đã xóa giỏ hàng')
                }}
              >
                <Trash2 className="mr-2 inline" size={16} /> Xóa tất cả
              </button>
              <button
                className="rounded-lg border border-blue-200 px-4 py-2 text-blue-600"
                onClick={() => cart.refetch()}
              >
                ⟳ Cập nhật giỏ hàng
              </button>
            </div>
          </section>
          <aside className="space-y-4">
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold">Mã giảm giá</h2>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  act(
                    () => applyCoupon.mutateAsync(code),
                    'Đã áp dụng mã giảm giá',
                  )
                }}
              >
                <input
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Nhập mã giảm giá"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
                <button
                  className="rounded-lg bg-blue-600 px-4 text-white"
                  disabled={!code.trim() || applyCoupon.isPending}
                >
                  Áp dụng
                </button>
              </form>
              {data.coupon && (
                <div className="mt-3 flex justify-between rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <span>Đã áp dụng: {data.coupon.code}</span>
                  <button
                    onClick={() =>
                      act(() => removeCoupon.mutateAsync(), 'Đã bỏ mã')
                    }
                  >
                    ✕
                  </button>
                </div>
              )}
              {data.couponError && (
                <p className="mt-2 text-sm text-red-600">{data.couponError}</p>
              )}
            </section>
            <section className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Tóm tắt đơn hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{money(data.subtotalMinor)}</span>
                </div>
                {data.discountMinor > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá ({data.coupon?.code})</span>
                    <span>-{money(data.discountMinor)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Thuế VAT (10%)</span>
                  <span>{money(data.taxMinor)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{money(data.totalMinor)}</span>
              </div>
              {data.hasUnavailableItems || data.couponError ? (
                <p className="mt-3 text-sm text-red-600">
                  Vui lòng xử lý gói hoặc mã giảm giá không khả dụng trước khi
                  thanh toán.
                </p>
              ) : (
                <Link
                  to="/customer/dashboard/checkout"
                  className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white"
                >
                  Tiến hành thanh toán →
                </Link>
              )}
            </section>
            <div className="rounded-xl bg-blue-50 p-5 text-sm text-[#26365e]">
              <ShieldCheck className="mb-2 text-blue-600" />
              Thông tin đơn hàng được bảo mật. Các cổng thanh toán sẽ được kết
              nối sau.
            </div>
            <div className="rounded-xl bg-blue-50 p-5 text-sm text-[#26365e]">
              <Headphones className="mb-2 text-blue-600" />
              Bạn cần hỗ trợ? Liên hệ đội ngũ hỗ trợ 24/7.
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
