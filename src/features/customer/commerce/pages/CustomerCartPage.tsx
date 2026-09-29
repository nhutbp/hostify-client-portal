import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { money } from '@/features/customer/catalog/types/customerCatalog'
import {
  useApplyCustomerCoupon,
  useClearCustomerCart,
  useCustomerCart,
  useRemoveCustomerCartItem,
  useRemoveCustomerCoupon,
  useUpdateCustomerCartItem,
} from '../hooks/useCustomerCart'

export default function CustomerCartPage() {
  const { t } = useTranslation()
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
        error instanceof Error ? error.message : t('customerCart.actionFailed'),
      )
    }
  }
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 text-[#101746]">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-5 py-4 dark:from-[#253145] dark:via-[#1c2536] dark:to-[#253145]">
        <div>
          <p className="text-sm text-slate-500">
            {t('customerCart.breadcrumb')}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{t('customerCart.title')}</h1>
          <p className="text-slate-500">{t('customerCart.subtitle')}</p>
        </div>
        <Link
          to="/customer/dashboard/buy"
          className="rounded-lg border border-blue-200 bg-white px-4 py-2 font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
        >
          ＋ {t('customerCart.continue')}
        </Link>
      </div>
      {cart.isPending ? (
        <div className="rounded-xl bg-white p-10">
          {t('customerCart.loading')}
        </div>
      ) : cart.isError ? (
        <div className="rounded-xl bg-white p-10 text-red-600">
          {t('customerCart.loadFailed')}{' '}
          <button onClick={() => cart.refetch()}>
            {t('customerBuy.retry')}
          </button>
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-xl bg-white p-12 text-center">
          <ShoppingCart className="mx-auto text-blue-600" size={42} />
          <h2 className="mt-3 text-xl font-bold">{t('customerCart.empty')}</h2>
          <Link
            to="/customer/dashboard/buy"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            {t('customerCart.choose')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <ShoppingCart size={19} />{' '}
              {t('customerCart.items', { count: data.count })}
            </h2>
            <div className="space-y-3">
              {data.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 p-4 transition hover:border-blue-200 hover:shadow-sm dark:from-[#253145] dark:to-[#1c2536]"
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
                              {t('customerCart.popular')}
                            </span>
                          )}
                        </h3>
                        <strong className="text-blue-600">
                          {item.totalMinor === null
                            ? t('customerCart.unavailable')
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
                          <span>
                            {item.features.bandwidth}{' '}
                            {t('customerCart.bandwidth')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!item.available && (
                    <p className="mt-3 text-sm text-red-600">
                      {t(item.categorySlug === 'vps' && !item.operatingSystem ? 'customerCart.chooseOsHint' : 'customerCart.unavailableHint')}
                    </p>
                  )}
                  <div className="mt-3 grid items-end gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                    <label className="text-sm font-semibold">
                      {t('customerCart.billingCycle')}
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
                            t('customerCart.cycleUpdated'),
                          )
                        }
                        disabled={update.isPending}
                      >
                        {item.availableCycles.map((cycle) => (
                          <option
                            key={cycle.billingCycle}
                            value={cycle.billingCycle}
                          >
                            {t(`customerBuy.cycles.${cycle.billingCycle}`, {
                              defaultValue: cycle.billingCycle,
                            })}{' '}
                            - {money(cycle.amountMinor)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {item.locations.length > 0 ? (
                      <label className="text-sm font-semibold">
                        {t('customerBuy.datacenter')}
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
                              t('customerCart.locationUpdated'),
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
                      {t('customerCart.quantity')}
                      <div className="mt-1 flex h-[42px] items-center rounded-lg border border-slate-200">
                        <button
                          className="px-2"
                          aria-label={t('customerCart.decrease')}
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
                              t('customerCart.quantityUpdated'),
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
                          aria-label={t('customerCart.increase')}
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
                              t('customerCart.quantityUpdated'),
                            )
                          }
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="mb-2 text-slate-500 hover:text-red-600"
                      aria-label={t('customerCart.remove')}
                      disabled={remove.isPending}
                      onClick={() =>
                        act(
                          () => remove.mutateAsync(item.id),
                          t('customerCart.removed'),
                        )
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
                            t('customerCart.osUpdated'),
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
                  if (window.confirm(t('customerCart.clearConfirm')))
                    act(() => clear.mutateAsync(), t('customerCart.cleared'))
                }}
              >
                <Trash2 className="mr-2 inline" size={16} />{' '}
                {t('customerCart.clear')}
              </button>
              <button
                className="rounded-lg border border-blue-200 px-4 py-2 text-blue-600"
                onClick={() => cart.refetch()}
              >
                ⟳ {t('customerCart.refresh')}
              </button>
            </div>
          </section>
          <aside className="space-y-4">
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold">
                {t('customerCart.coupon')}
              </h2>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  act(
                    () => applyCoupon.mutateAsync(code),
                    t('customerCart.couponApplied'),
                  )
                }}
              >
                <input
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2"
                  placeholder={t('customerCart.couponPlaceholder')}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
                <button
                  className="rounded-lg bg-blue-600 px-4 text-white"
                  disabled={!code.trim() || applyCoupon.isPending}
                >
                  {t('customerCart.apply')}
                </button>
              </form>
              {data.coupon && (
                <div className="mt-3 flex justify-between rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <span>
                    {t('customerCart.applied', { code: data.coupon.code })}
                  </span>
                  <button
                    onClick={() =>
                      act(
                        () => removeCoupon.mutateAsync(),
                        t('customerCart.couponRemoved'),
                      )
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
            <section className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 p-5 shadow-sm dark:from-[#253145] dark:to-[#1c2536]">
              <h2 className="mb-4 text-lg font-bold">
                {t('customerCart.summary')}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('customerCart.subtotal')}</span>
                  <span>{money(data.subtotalMinor)}</span>
                </div>
                {data.discountMinor > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      {t('customerCart.discount', { code: data.coupon?.code })}
                    </span>
                    <span>-{money(data.discountMinor)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('customerCart.vat')}</span>
                  <span>{money(data.taxMinor)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">
                <span>{t('customerCart.total')}</span>
                <span className="text-blue-600">{money(data.totalMinor)}</span>
              </div>
              {data.hasUnavailableItems || data.couponError ? (
                <p className="mt-3 text-sm text-red-600">
                  {t('customerCart.resolveUnavailable')}
                </p>
              ) : (
                <Link
                  to="/customer/dashboard/checkout"
                  className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white"
                >
                  {t('customerCart.checkout')}
                </Link>
              )}
            </section>
            <div className="rounded-xl bg-blue-50 p-5 text-sm text-[#26365e]">
              <ShieldCheck className="mb-2 text-blue-600" />
              {t('customerCart.security')}
            </div>
            <div className="rounded-xl bg-blue-50 p-5 text-sm text-[#26365e]">
              <Headphones className="mb-2 text-blue-600" />
              {t('customerCart.help')}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
