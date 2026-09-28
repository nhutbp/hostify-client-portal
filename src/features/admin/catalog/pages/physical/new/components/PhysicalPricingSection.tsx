import { Plus, Tag, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  PhysicalCard,
  PhysicalField,
  physicalInputClass,
} from './PhysicalFormUi'
import { physicalCycles } from './physicalFormTypes'
import type {
  PhysicalCycle,
  PhysicalFormDraft,
  PhysicalPriceDraft,
} from './physicalFormTypes'

const cycleKey: Record<PhysicalCycle, string> = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semiAnnual',
  YEARLY: 'yearly',
}
const cycleMonths: Record<PhysicalCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  YEARLY: 12,
}
const digits = (value: string) => value.replace(/[^0-9]/g, '')
const money = (value: string | number) =>
  value === '' ? '' : Number(value || 0).toLocaleString('en-US')

export function PhysicalPricingSection({
  form,
  update,
}: {
  form: PhysicalFormDraft
  update: (patch: Partial<PhysicalFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  const setPrice = (cycle: PhysicalCycle, patch: Partial<PhysicalPriceDraft>) =>
    update({
      billingPrices: form.billingPrices.map((price) =>
        price.billingCycle === cycle ? { ...price, ...patch } : price,
      ),
    })
  const setMonthlyPrice = (amount: string) =>
    update({
      defaultPrice: amount,
      billingPrices: form.billingPrices.map((price) =>
        price.billingCycle === 'MONTHLY' ? { ...price, amount } : price,
      ),
    })
  const addPeriod = () => {
    const cycle = physicalCycles.find(
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
            physicalCycles.indexOf(a.billingCycle) -
            physicalCycles.indexOf(b.billingCycle),
        ),
      })
  }
  return (
    <PhysicalCard icon={Tag} title={t('physical.new.pricing')}>
      <PhysicalField
        name="defaultPrice"
        label={t('physical.new.defaultPrice')}
        required
      >
        <div className="flex">
          <input
            id="defaultPrice"
            name="defaultPrice"
            required
            inputMode="numeric"
            className={`${physicalInputClass} rounded-r-none`}
            value={money(form.defaultPrice)}
            onChange={(event) => setMonthlyPrice(digits(event.target.value))}
          />
          <span className="flex min-w-24 items-center justify-center rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 text-xs">
            đ/{t('physical.monthly')}
          </span>
        </div>
      </PhysicalField>
      <h3 className="mb-2 mt-5 text-sm font-semibold text-[#11184c]">
        {t('physical.new.pricingTable')}
      </h3>
      <div className="overflow-x-auto rounded-md border border-[#d5e1f2]">
        <table className="w-full min-w-[450px] text-left text-sm">
          <thead className="bg-[#f5f8fd] text-[#11184c]">
            <tr>
              <th className="px-2 py-2">{t('physical.new.cycle')}</th>
              <th className="px-2 py-2">{t('physical.new.amount')}</th>
              <th className="px-2 py-2">{t('physical.new.discount')}</th>
              <th className="px-2 py-2">{t('physical.new.afterDiscount')}</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5e1f2]">
            {form.billingPrices.map((price) => (
              <tr key={price.billingCycle}>
                <td className="whitespace-nowrap px-2 py-2">
                  {t(`physical.new.${cycleKey[price.billingCycle]}`)}
                </td>
                <td className="p-1">
                  <input
                    aria-label={`${t('physical.new.amount')} ${t(`physical.new.${cycleKey[price.billingCycle]}`)}`}
                    inputMode="numeric"
                    className="w-full min-w-20 rounded border border-transparent px-1 py-1.5 focus:border-blue-500"
                    value={money(price.amount)}
                    onChange={(event) =>
                      price.billingCycle === 'MONTHLY'
                        ? setMonthlyPrice(digits(event.target.value))
                        : setPrice(price.billingCycle, {
                            amount: digits(event.target.value),
                          })
                    }
                  />
                </td>
                <td className="p-1">
                  {price.billingCycle === 'MONTHLY' ? (
                    '—'
                  ) : (
                    <div className="flex">
                      <input
                        aria-label={`${t('physical.new.discount')} ${t(`physical.new.${cycleKey[price.billingCycle]}`)}`}
                        type="number"
                        min="0"
                        max="100"
                        className="w-12 rounded border border-transparent px-1 py-1.5 focus:border-blue-500"
                        value={price.discountPercent}
                        onChange={(event) =>
                          setPrice(price.billingCycle, {
                            discountPercent: event.target.value,
                          })
                        }
                      />
                      %
                    </div>
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
                      aria-label={`${t('physical.new.removePeriod')} ${t(`physical.new.${cycleKey[price.billingCycle]}`)}`}
                      className="p-2 text-slate-500 hover:text-red-600"
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
      <button
        type="button"
        disabled={form.billingPrices.length === physicalCycles.length}
        onClick={addPeriod}
        className="mt-3 inline-flex items-center gap-1 rounded-md border border-blue-300 px-3 py-1.5 text-sm text-blue-600 disabled:opacity-40"
      >
        <Plus className="size-4" />
        {t('physical.new.addPeriod')}
      </button>
    </PhysicalCard>
  )
}
