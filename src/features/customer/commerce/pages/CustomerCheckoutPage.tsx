import { useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { CreditCard, QrCode, Server, ShieldCheck, Wallet } from 'lucide-react'
import { toast } from '@/utils/toast'
import {
  cycleLabels,
  money,
} from '@/features/customer/catalog/types/customerCatalog'
import {
  useApplyCustomerCoupon,
  useCustomerCart,
  useRemoveCustomerCoupon,
  useUpdateCustomerCartItem,
} from '../hooks/useCustomerCart'
import { useCreateCustomerOrder } from '../hooks/useCustomerOrder'
import { VpsOperatingSystemSelect } from '../components/VpsOperatingSystemSelect'

const paymentMethods = [
  {
    id: 'WALLET',
    title: 'Ví điện tử (Nạp tiền)',
    detail: 'Ghi nhận đơn, chưa trừ số dư ví',
    icon: Wallet,
  },
  {
    id: 'MOMO',
    title: 'MoMo',
    detail: 'Cổng thanh toán sẽ kết nối sau',
    icon: Wallet,
  },
  {
    id: 'VIETQR',
    title: 'VietQR / Ngân hàng',
    detail: 'Mã QR sẽ được cung cấp sau',
    icon: QrCode,
  },
  {
    id: 'CARD',
    title: 'Thẻ ngân hàng',
    detail: 'Visa, Mastercard, JCB…',
    icon: CreditCard,
  },
  {
    id: 'USDT_TRC20',
    title: 'USDT (TRC20)',
    detail: 'Thanh toán bằng tiền điện tử',
    icon: Wallet,
  },
] as const

export default function CustomerCheckoutPage() {
  const cart = useCustomerCart()
  const update = useUpdateCustomerCartItem()
  const apply = useApplyCustomerCoupon()
  const remove = useRemoveCustomerCoupon()
  const create = useCreateCustomerOrder()
  const navigate = useNavigate()
  const key = useRef(crypto.randomUUID())
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof paymentMethods)[number]['id']>('VIETQR')
  const [code, setCode] = useState('')
  const [note, setNote] = useState('')
  const [terms, setTerms] = useState(false)
  const [configuration, setConfiguration] = useState<
    Record<string, { hostname?: string }>
  >({})
  const data = cart.data

  async function submit() {
    if (
      !data?.items.length ||
      data.hasUnavailableItems ||
      data.couponError ||
      !terms
    )
      return
    try {
      const order = await create.mutateAsync({
        idempotencyKey: key.current,
        paymentMethod,
        customerNote: note,
        termsAccepted: true,
        configurations: data.items.map((item) => ({
          cartItemId: item.id,
          ...(item.categorySlug === 'vps' && item.operatingSystem
            ? { operatingSystem: item.operatingSystem }
            : {}),
          ...configuration[item.id],
        })),
      })
      await navigate({
        to: '/customer/dashboard/orders/$id',
        params: { id: order.id },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đặt hàng')
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 text-[#101746]">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-5 py-4">
        <p className="text-sm text-slate-500">
          Mua dịch vụ / Giỏ hàng / Thanh toán
        </p>
        <h1 className="mt-1 text-3xl font-bold">Thanh toán</h1>
        <p className="text-slate-500">
          Hoàn tất đơn hàng để kích hoạt dịch vụ của bạn
        </p>
      </div>
      {cart.isPending ? (
        <div className="rounded-xl bg-white p-10">Đang tải đơn hàng...</div>
      ) : !data?.items.length ? (
        <div className="rounded-xl bg-white p-10">
          Giỏ hàng trống.{' '}
          <Link className="text-blue-600" to="/customer/dashboard/buy">
            Chọn dịch vụ
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              <span className="mr-2 rounded-full bg-blue-600 px-3 py-1 text-white">
                1
              </span>{' '}
              Thông tin dịch vụ
            </h2>
            <div className="mt-4 space-y-4">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 p-4"
                >
                  <div className="flex gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <Server className="text-blue-600" size={25} />
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <strong>{item.productName}</strong>
                        <strong className="text-blue-600">
                          {money(item.totalMinor ?? 0)}
                        </strong>
                      </div>
                      <p className="text-sm text-slate-500">
                        {item.description || item.planName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 rounded-lg bg-blue-50/70 px-3 py-2 text-sm">
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
                        <span>Số lượng: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold">
                      Chu kỳ thanh toán
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {item.availableCycles.map((cycle) => (
                        <button
                          key={cycle.billingCycle}
                          type="button"
                          disabled={update.isPending}
                          onClick={async () => {
                            try {
                              await update.mutateAsync({
                                id: item.id,
                                quantity: item.quantity,
                                billingCycle: cycle.billingCycle,
                                datacenterId: item.datacenterId,
                              })
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : 'Không thể cập nhật chu kỳ',
                              )
                            }
                          }}
                          className={`rounded-lg border p-2.5 text-left text-sm transition ${item.billingCycle === cycle.billingCycle ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                        >
                          <strong className="block">
                            {cycleLabels[cycle.billingCycle] ??
                              cycle.billingCycle}
                          </strong>
                          {money(cycle.amountMinor)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.locations.length > 0 && (
                      <label className="text-sm font-semibold">
                        Vị trí Datacenter
                        <select
                          className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 font-normal"
                          value={item.datacenterId ?? ''}
                          onChange={async (event) => {
                            try {
                              await update.mutateAsync({
                                id: item.id,
                                quantity: item.quantity,
                                billingCycle: item.billingCycle,
                                datacenterId: event.target.value,
                              })
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : 'Không thể cập nhật vị trí',
                              )
                            }
                          }}
                        >
                          {item.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {item.categorySlug === 'vps' && (
                      <VpsOperatingSystemSelect
                        value={item.operatingSystem}
                        options={item.availableOperatingSystems}
                        disabled={update.isPending}
                        onChange={async (operatingSystem) => {
                          try {
                            await update.mutateAsync({
                              id: item.id,
                              quantity: item.quantity,
                              billingCycle: item.billingCycle,
                              datacenterId: item.datacenterId,
                              operatingSystem,
                            })
                            toast.success('Đã cập nhật hệ điều hành')
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : 'Không thể cập nhật hệ điều hành',
                            )
                          }
                        }}
                      />
                    )}
                    {item.categorySlug === 'vps' && (
                      <label className="text-sm font-semibold sm:col-span-2">
                        Tên máy chủ (Hostname) (tùy chọn)
                        <input
                          className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 font-normal"
                          placeholder={
                            item.operatingSystem?.startsWith('N8N')
                              ? 'n8n.example.com'
                              : 'web-server-01'
                          }
                          value={configuration[item.id]?.hostname ?? ''}
                          onChange={(event) =>
                            setConfiguration((current) => ({
                              ...current,
                              [item.id]: {
                                ...current[item.id],
                                hostname: event.target.value,
                              },
                            }))
                          }
                        />
                        <small className="font-normal text-slate-500">
                          Dùng chữ cái, số, dấu gạch ngang; với N8N cần tên miền
                          đầy đủ.
                        </small>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <label className="mt-5 block font-semibold">
              Ghi chú đơn hàng (tùy chọn)
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"
                rows={3}
                maxLength={1000}
                placeholder="Ví dụ: Cài sẵn phần mềm, mở port, ..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          </section>
          <aside className="space-y-4">
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">
                <span className="mr-2 rounded-full bg-blue-600 px-3 py-1 text-white">
                  2
                </span>{' '}
                Mã giảm giá
              </h2>
              <form
                className="mt-4 flex gap-2"
                onSubmit={async (event) => {
                  event.preventDefault()
                  try {
                    await apply.mutateAsync(code)
                    toast.success('Đã áp dụng mã')
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Mã không khả dụng',
                    )
                  }
                }}
              >
                <input
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3"
                  placeholder="Nhập mã giảm giá (nếu có)"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                  disabled={!code.trim() || apply.isPending}
                >
                  Áp dụng
                </button>
              </form>
              {data.coupon && (
                <div className="mt-3 flex justify-between rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <span>Đã áp dụng mã: {data.coupon.code}</span>
                  <button onClick={() => remove.mutate()}>✕</button>
                </div>
              )}
              {data.couponError && (
                <p className="mt-2 text-sm text-red-600">{data.couponError}</p>
              )}
            </section>
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">
                <span className="mr-2 rounded-full bg-blue-600 px-3 py-1 text-white">
                  3
                </span>{' '}
                Phương thức thanh toán
              </h2>
              <div className="mt-4 space-y-2">
                {paymentMethods.map(({ id, title, detail, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${paymentMethod === id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === id}
                      onChange={() => setPaymentMethod(id)}
                    />
                    <Icon className="text-blue-600" size={24} />
                    <span>
                      <strong className="block text-sm">{title}</strong>
                      <small className="text-slate-500">{detail}</small>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Các cổng thanh toán hiện chưa kết nối. Đơn hàng sẽ được ghi nhận
                chờ thanh toán.
              </p>
            </section>
            <section className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 p-5 shadow-sm">
              <h2 className="text-lg font-bold">
                <span className="mr-2 rounded-full bg-blue-600 px-3 py-1 text-white">
                  4
                </span>{' '}
                Tổng tiền
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                {data.items.map((item) => (
                  <div className="flex justify-between gap-3" key={item.id}>
                    <span>
                      {item.productName} (
                      {cycleLabels[item.billingCycle] ?? item.billingCycle}) ×{' '}
                      {item.quantity}
                    </span>
                    <span>{money(item.totalMinor ?? 0)}</span>
                  </div>
                ))}
                {data.discountMinor > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá ({data.coupon?.code})</span>
                    <span>-{money(data.discountMinor)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Tạm tính</span>
                  <span>{money(data.subtotalMinor - data.discountMinor)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế VAT (10%)</span>
                  <span>{money(data.taxMinor)}</span>
                </div>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 text-xl font-bold">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{money(data.totalMinor)}</span>
              </div>
              <button
                className="mt-4 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50"
                disabled={
                  !terms ||
                  data.hasUnavailableItems ||
                  Boolean(data.couponError) ||
                  create.isPending
                }
                onClick={submit}
              >
                <ShieldCheck className="mr-2 inline" size={18} />
                {create.isPending
                  ? 'Đang ghi nhận đơn...'
                  : 'Đặt hàng — chờ thanh toán'}
              </button>
              <label className="mt-3 flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(event) => setTerms(event.target.checked)}
                />
                <span>
                  Tôi đã đọc và đồng ý với Điều khoản dịch vụ và Chính sách hoàn
                  tiền.
                </span>
              </label>
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}
