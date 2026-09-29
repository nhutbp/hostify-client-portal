import { Link } from '@tanstack/react-router'
import { Server, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CustomerPackage } from '../types/customerCatalog'
import { money } from '../types/customerCatalog'

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
  const { t, i18n } = useTranslation()
  const price = item?.prices[cycle]
  const setupFee = item?.setupFees[cycle] ?? 0
  const locationRequired = Boolean(item?.locations.length)
  const canAdd = Boolean(
    item && price !== undefined && (!locationRequired || locationId),
  )
  return (
    <aside className="h-fit rounded-xl bg-white p-5 shadow-sm">
      <h2 className="border-b border-slate-100 pb-3 text-lg font-bold">
        {t('customerBuy.summary')}
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
                  {money(price, i18n.language)}
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                {t('customerBuy.cycle')}:{' '}
                {t(`customerBuy.cycles.${cycle}`, { defaultValue: cycle })}
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
              {t('customerBuy.datacenter')}
              <select
                value={locationId}
                onChange={(event) => onLocationChange(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3"
              >
                <option value="">{t('customerBuy.selectLocation')}</option>
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
              <span>{t('customerBuy.packagePrice')}</span>
              <span>{money(price, i18n.language)}</span>
            </div>
            {setupFee > 0 && (
              <div className="flex justify-between">
                <span>{t('customerBuy.setupFee')}</span>
                <span>{money(setupFee, i18n.language)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2 border-t border-slate-100 py-4 font-bold">
            <span>{t('customerBuy.subtotal')}</span>
            <span className="text-xl text-blue-600">
              {money(price + setupFee, i18n.language)}
            </span>
          </div>
          <button
            type="button"
            disabled={!canAdd || pending}
            onClick={onAdd}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <ShoppingCart size={18} />
            {pending ? t('customerBuy.adding') : t('customerBuy.addToCart')}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            {t('customerBuy.checkoutHint')}
          </p>
        </>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          {t('customerBuy.selectForPrice')}
        </p>
      )}
      <Link
        to="/customer/dashboard/cart"
        className="mt-4 block text-center text-sm font-semibold text-blue-600"
      >
        {t('customerBuy.viewCart')}
      </Link>
    </aside>
  )
}
