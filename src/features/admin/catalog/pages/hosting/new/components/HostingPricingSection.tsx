import { Info, Plus, Tag, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HostingCard, HostingField, hostingInputClass } from './HostingFormUi'
import { hostingCycles } from './hostingFormTypes'
import type {
  BillingCycle,
  HostingFormDraft,
  HostingPriceDraft,
} from './hostingFormTypes'

type Props = {
  form: HostingFormDraft
  update: (patch: Partial<HostingFormDraft>) => void
}

const formatMoney = (value: string | number) =>
  Number(value || 0).toLocaleString('en-US')
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '')
const cycleKey: Record<BillingCycle, string> = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semiAnnual',
  YEARLY: 'yearly',
}

export function HostingPricingSection({ form, update }: Props) {
  const { t } = useTranslation('catalog')
  const setDefaultPrice = (value: string) => {
    const next = onlyDigits(value)
    update({
      defaultPrice: next,
      billingPrices: form.billingPrices.map((price) =>
        price.billingCycle === 'MONTHLY' ? { ...price, amount: next } : price,
      ),
    })
  }
  const setPrice = (cycle: BillingCycle, patch: Partial<HostingPriceDraft>) =>
    update({
      billingPrices: form.billingPrices.map((price) =>
        price.billingCycle === cycle ? { ...price, ...patch } : price,
      ),
    })
  const addPeriod = () => {
    const cycle = hostingCycles.find(
      (item) =>
        !form.billingPrices.some((price) => price.billingCycle === item),
    )
    if (cycle)
      update({
        billingPrices: [
          ...form.billingPrices,
          {
            billingCycle: cycle,
            amount: String(
              Number(form.defaultPrice) *
                (
                  { QUARTERLY: 3, SEMI_ANNUAL: 6, YEARLY: 12 } as Record<
                    string,
                    number
                  >
                )[cycle],
            ),
            discountPercent: '0',
          },
        ].sort(
          (a, b) =>
            hostingCycles.indexOf(a.billingCycle) -
            hostingCycles.indexOf(b.billingCycle),
        ),
      })
  }
  return (
    <HostingCard icon={Tag} title={t('hosting.new.pricing')}>
      <HostingField
        label={t('hosting.new.defaultPrice')}
        required
        hint={t('hosting.new.defaultPriceHint')}
      >
        <div className="flex">
          <input
            required
            inputMode="numeric"
            className={`${hostingInputClass} rounded-r-none`}
            value={formatMoney(form.defaultPrice)}
            onChange={(event) => setDefaultPrice(event.target.value)}
          />
          <span className="flex min-w-24 items-center justify-center rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 text-xs text-[#4b5e82]">
            đ/{t('hosting.monthly')}
          </span>
        </div>
      </HostingField>
      <h3 className="mb-2.5 mt-6 text-sm font-semibold text-[#11184c]">
        {t('hosting.new.pricingTable')}
      </h3>
      <div className="overflow-x-auto rounded-md border border-[#d5e1f2]">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-[#f5f8fd] text-[#11184c]">
            <tr>
              <th className="px-2.5 py-2.5">{t('hosting.new.cycle')}</th>
              <th className="px-2.5 py-2.5">{t('hosting.new.amount')}</th>
              <th className="px-2.5 py-2.5">{t('hosting.new.discount')}</th>
              <th className="px-2.5 py-2.5">
                {t('hosting.new.afterDiscount')}
              </th>
              <th className="w-9" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5e1f2]">
            {form.billingPrices.map((price) => (
              <tr key={price.billingCycle}>
                <td className="whitespace-nowrap px-2.5 py-2">
                  {t(`hosting.new.${cycleKey[price.billingCycle]}`)}
                </td>
                <td className="p-1.5">
                  <input
                    aria-label={`${t('hosting.new.amount')} ${t(`hosting.new.${cycleKey[price.billingCycle]}`)}`}
                    inputMode="numeric"
                    className="w-full min-w-20 rounded border border-transparent px-1.5 py-1.5 outline-none focus:border-blue-500"
                    value={formatMoney(price.amount)}
                    onChange={(event) => {
                      const amount = onlyDigits(event.target.value)
                      if (price.billingCycle === 'MONTHLY')
                        update({
                          defaultPrice: amount,
                          billingPrices: form.billingPrices.map((row) =>
                            row.billingCycle === 'MONTHLY'
                              ? { ...row, amount }
                              : row,
                          ),
                        })
                      else setPrice(price.billingCycle, { amount })
                    }}
                  />
                </td>
                <td className="p-1.5">
                  {price.billingCycle === 'MONTHLY' ? (
                    <span className="px-2">–</span>
                  ) : (
                    <div className="flex items-center">
                      <input
                        aria-label={`${t('hosting.new.discount')} ${t(`hosting.new.${cycleKey[price.billingCycle]}`)}`}
                        type="number"
                        min="0"
                        max="100"
                        className="w-11 rounded border border-transparent px-1 py-1.5 outline-none focus:border-blue-500"
                        value={price.discountPercent}
                        onChange={(event) =>
                          setPrice(price.billingCycle, {
                            discountPercent: event.target.value,
                          })
                        }
                      />
                      <span>%</span>
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-2.5 py-2 font-semibold text-blue-600">
                  {formatMoney(
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
                      aria-label={`${t('hosting.new.removePeriod')} ${t(`hosting.new.${cycleKey[price.billingCycle]}`)}`}
                      className="p-1.5 text-slate-500 hover:text-red-600"
                      onClick={() =>
                        update({
                          billingPrices: form.billingPrices.filter(
                            (item) => item.billingCycle !== price.billingCycle,
                          ),
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
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
        disabled={form.billingPrices.length === hostingCycles.length}
        onClick={addPeriod}
        className="mt-2.5 inline-flex h-9 items-center gap-2 rounded-md border border-blue-200 px-3 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-40"
      >
        <Plus className="size-4" />
        {t('hosting.new.addPeriod')}
      </button>
      <p className="mt-4 flex gap-2 rounded-lg bg-blue-50 px-3 py-3 text-xs text-[#5a6f94]">
        <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
        {t('hosting.new.pricingHint')}
      </p>
    </HostingCard>
  )
}
