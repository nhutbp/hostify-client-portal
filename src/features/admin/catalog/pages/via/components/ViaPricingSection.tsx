import { Plus, Tag, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ViaCard, ViaField, viaInputClass } from './ViaFormUi'
import type { ViaFormDraft } from './viaFormTypes'

const digits = (value: string) => value.replace(/[^0-9]/g, '')
const money = (value: string | number) =>
  value === '' ? '' : Number(value || 0).toLocaleString('en-US')

export function ViaPricingSection({
  form,
  update,
}: {
  form: ViaFormDraft
  update: (patch: Partial<ViaFormDraft>) => void
}) {
  const { t } = useTranslation('catalog')
  const setBasePrice = (amount: string) =>
    update({
      defaultPrice: amount,
      quantityPrices: form.quantityPrices.map((tier) =>
        tier.quantity === '1' ? { ...tier, amount } : tier,
      ),
    })
  const setTier = (
    index: number,
    patch: Partial<ViaFormDraft['quantityPrices'][number]>,
  ) =>
    update({
      quantityPrices: form.quantityPrices.map((tier, current) =>
        current === index ? { ...tier, ...patch } : tier,
      ),
    })
  const addTier = () => {
    const quantity =
      [10, 50, 100].find(
        (value) =>
          !form.quantityPrices.some((tier) => Number(tier.quantity) === value),
      ) ??
      Math.max(
        1,
        ...form.quantityPrices.map((tier) => Number(tier.quantity) || 0),
      ) + 1
    update({
      quantityPrices: [
        ...form.quantityPrices,
        {
          quantity: String(quantity),
          amount: String(Number(form.defaultPrice) * quantity),
          discountPercent: '0',
        },
      ],
    })
  }
  return (
    <ViaCard icon={Tag} title={t('via.new.pricing')}>
      <ViaField name="defaultPrice" label={t('via.new.defaultPrice')} required>
        <div className="flex">
          <input
            id="defaultPrice"
            name="defaultPrice"
            required
            inputMode="numeric"
            className={`${viaInputClass} rounded-r-none`}
            value={money(form.defaultPrice)}
            onChange={(event) => setBasePrice(digits(event.target.value))}
          />
          <span className="flex min-w-28 items-center justify-center rounded-r-md border border-l-0 border-[#d5e1f2] bg-slate-50 text-sm">
            đ/{t('via.account')}
          </span>
        </div>
      </ViaField>
      <h3 className="mb-2 mt-5 text-sm font-semibold text-[#11184c]">
        {t('via.new.pricingTable')}
      </h3>
      <div className="overflow-x-auto rounded-md border border-[#d5e1f2]">
        <table className="w-full min-w-[450px] text-left text-sm">
          <thead className="bg-[#f5f8fd] text-[#11184c]">
            <tr>
              <th className="px-2 py-2">{t('via.new.quantity')}</th>
              <th className="px-2 py-2">{t('via.new.amount')}</th>
              <th className="px-2 py-2">{t('via.new.discount')}</th>
              <th className="px-2 py-2">{t('via.new.afterDiscount')}</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d5e1f2]">
            {form.quantityPrices.map((tier, index) => (
              <tr key={index}>
                <td className="p-1">
                  <input
                    aria-label={`${t('via.new.quantity')} ${index + 1}`}
                    type="number"
                    min={1}
                    disabled={index === 0}
                    className="w-16 rounded border border-[#d5e1f2] px-1 py-1.5 disabled:bg-slate-50"
                    value={tier.quantity}
                    onChange={(event) =>
                      setTier(index, { quantity: event.target.value })
                    }
                  />
                </td>
                <td className="p-1">
                  <input
                    aria-label={`${t('via.new.amount')} ${index + 1}`}
                    inputMode="numeric"
                    className="w-24 rounded border border-[#d5e1f2] px-1 py-1.5"
                    value={money(tier.amount)}
                    onChange={(event) =>
                      index === 0
                        ? setBasePrice(digits(event.target.value))
                        : setTier(index, { amount: digits(event.target.value) })
                    }
                  />
                </td>
                <td className="p-1">
                  {index === 0 ? (
                    '—'
                  ) : (
                    <input
                      aria-label={`${t('via.new.discount')} ${index + 1}`}
                      type="number"
                      min={0}
                      max={100}
                      className="w-14 rounded border border-[#d5e1f2] px-1 py-1.5"
                      value={tier.discountPercent}
                      onChange={(event) =>
                        setTier(index, { discountPercent: event.target.value })
                      }
                    />
                  )}
                </td>
                <td className="whitespace-nowrap px-2 font-semibold text-blue-600">
                  {money(
                    Math.round(
                      Number(tier.amount || 0) *
                        (1 - Number(tier.discountPercent || 0) / 100),
                    ),
                  )}
                </td>
                <td>
                  {index > 0 && (
                    <button
                      type="button"
                      aria-label={t('via.new.removeTier')}
                      onClick={() =>
                        update({
                          quantityPrices: form.quantityPrices.filter(
                            (_, current) => current !== index,
                          ),
                        })
                      }
                      className="p-1 text-slate-500"
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
      {form.quantityPrices.length < 20 && (
        <button
          type="button"
          onClick={addTier}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-blue-200 px-3 py-2 text-sm text-blue-600"
        >
          <Plus className="size-4" />
          {t('via.new.addTier')}
        </button>
      )}
    </ViaCard>
  )
}
