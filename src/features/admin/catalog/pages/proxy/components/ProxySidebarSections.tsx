import { Building2, Info, Plus, Tag, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProxyCard, ProxyField, proxyInputClass } from './ProxyFormUi'
import { proxyCycles } from './proxyFormTypes'
import type { ProxyCycle, ProxyFormDraft } from './proxyFormTypes'

const cycleMonths: Record<ProxyCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  YEARLY: 12,
}
const cycleKeys: Record<ProxyCycle, string> = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semiAnnual',
  YEARLY: 'yearly',
}
const digits = (value: string) => value.replace(/[^0-9]/g, '')
const money = (value: string | number) =>
  value === '' ? '' : Number(value || 0).toLocaleString('en-US')

export function ProxyPricingSection({
  form,
  update,
}: {
  form: ProxyFormDraft
  update: (patch: Partial<ProxyFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  const setMonthly = (amount: string) =>
    update({
      defaultPrice: amount,
      billingPrices: form.billingPrices.map((price) =>
        price.billingCycle === 'MONTHLY' ? { ...price, amount } : price,
      ),
    })
  const setPrice = (
    cycle: ProxyCycle,
    field: 'amount' | 'discountPercent',
    value: string,
  ) =>
    update({
      billingPrices: form.billingPrices.map((price) =>
        price.billingCycle === cycle ? { ...price, [field]: value } : price,
      ),
    })
  const addPeriod = () => {
    const cycle = proxyCycles.find(
      (item) =>
        !form.billingPrices.some((price) => price.billingCycle === item),
    )
    if (cycle)
      update({
        billingPrices: [
          ...form.billingPrices,
          {
            billingCycle: cycle,
            amount: String(Number(form.defaultPrice) * cycleMonths[cycle]),
            discountPercent: '0',
          },
        ].sort(
          (a, b) =>
            proxyCycles.indexOf(a.billingCycle) -
            proxyCycles.indexOf(b.billingCycle),
        ),
      })
  }
  return (
    <ProxyCard icon={Tag} title={t('proxy.new.pricing')}>
      <ProxyField
        name="defaultPrice"
        label={t('proxy.new.defaultPrice')}
        required
      >
        <div className="flex">
          <input
            id="defaultPrice"
            name="defaultPrice"
            required
            inputMode="numeric"
            className={`${proxyInputClass} rounded-r-none`}
            value={money(form.defaultPrice)}
            onChange={(event) => setMonthly(digits(event.target.value))}
          />
          <span className="flex min-w-20 items-center justify-center rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 text-sm">
            đ/{t('proxy.monthly')}
          </span>
        </div>
      </ProxyField>
      <h3 className="mb-2 mt-5 text-sm font-semibold text-[#11184c]">
        {t('proxy.new.pricingTable')}
      </h3>
      <div className="overflow-x-auto rounded-md border border-[#d5e1f2]">
        <table className="w-full min-w-[410px] text-left text-xs">
          <thead className="bg-[#f5f8fd] text-[#11184c]">
            <tr>
              <th className="px-2 py-2">{t('proxy.new.cycle')}</th>
              <th className="px-2 py-2">{t('proxy.new.amount')}</th>
              <th className="px-2 py-2">{t('proxy.new.discount')}</th>
              <th className="px-2 py-2">{t('proxy.new.afterDiscount')}</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5e1f2]">
            {form.billingPrices.map((price) => (
              <tr key={price.billingCycle}>
                <td className="whitespace-nowrap px-2 py-2">
                  {t(`proxy.new.${cycleKeys[price.billingCycle]}`)}
                </td>
                <td className="p-1">
                  <input
                    aria-label={`${t('proxy.new.amount')} ${price.billingCycle}`}
                    inputMode="numeric"
                    className="w-20 rounded border border-[#d5e1f2] px-1 py-1.5"
                    value={money(price.amount)}
                    onChange={(event) =>
                      price.billingCycle === 'MONTHLY'
                        ? setMonthly(digits(event.target.value))
                        : setPrice(
                            price.billingCycle,
                            'amount',
                            digits(event.target.value),
                          )
                    }
                  />
                </td>
                <td className="p-1">
                  {price.billingCycle === 'MONTHLY' ? (
                    '—'
                  ) : (
                    <input
                      aria-label={`${t('proxy.new.discount')} ${price.billingCycle}`}
                      type="number"
                      min={0}
                      max={100}
                      className="w-12 rounded border border-[#d5e1f2] px-1 py-1.5"
                      value={price.discountPercent}
                      onChange={(event) =>
                        setPrice(
                          price.billingCycle,
                          'discountPercent',
                          event.target.value,
                        )
                      }
                    />
                  )}
                </td>
                <td className="whitespace-nowrap px-2 font-semibold text-blue-600">
                  {money(
                    Math.round(
                      Number(price.amount || 0) *
                        (1 - Number(price.discountPercent || 0) / 100),
                    ),
                  )}
                </td>
                <td>
                  {price.billingCycle !== 'MONTHLY' && (
                    <button
                      type="button"
                      aria-label={t('proxy.new.removePeriod')}
                      className="p-1 text-slate-500"
                      onClick={() =>
                        update({
                          billingPrices: form.billingPrices.filter(
                            (item) => item.billingCycle !== price.billingCycle,
                          ),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {form.billingPrices.length < 4 && (
        <button
          type="button"
          onClick={addPeriod}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-600"
        >
          <Plus className="size-4" />
          {t('proxy.new.addPeriod')}
        </button>
      )}
      <p className="mt-4 flex gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
        <Info className="size-4 shrink-0" />
        {t('proxy.new.pricingHint')}
      </p>
    </ProxyCard>
  )
}

type Provider = { id: string; name: string; description?: string | null }
export function ProxyProviderSection({
  form,
  update,
  providers,
}: {
  form: ProxyFormDraft
  update: (patch: Partial<ProxyFormDraft>) => void
  providers: Provider[]
}) {
  const { t } = useTranslation('catalog')
  const selected = providers.find(
    (provider) => provider.id === form.providerCategoryId,
  )
  return (
    <ProxyCard icon={Building2} title={t('proxy.new.providerSection')}>
      <ProxyField
        name="providerCategoryId"
        label={t('proxy.new.provider')}
        required
      >
        <select
          id="providerCategoryId"
          name="providerCategoryId"
          className={proxyInputClass}
          value={form.providerCategoryId}
          onChange={(event) =>
            update({ providerCategoryId: event.target.value })
          }
        >
          <option value="">{t('proxy.new.selectProvider')}</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </ProxyField>
      <p className="mt-2 text-xs text-slate-500">
        {t('proxy.new.providerHint')}
      </p>
      {selected && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
          <p className="font-semibold text-[#11184c]">
            {t('proxy.new.providerInfo')}
          </p>
          <p className="mt-1 text-slate-600">{selected.name}</p>
          {selected.description && (
            <p className="mt-1 text-slate-500">{selected.description}</p>
          )}
        </div>
      )}
      {providers.length === 0 && (
        <p className="mt-3 text-sm text-amber-700">
          {t('proxy.new.providerMissing')}
        </p>
      )}
    </ProxyCard>
  )
}
