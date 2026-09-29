import {
  Check,
  Cpu,
  Database,
  Globe2,
  HardDrive,
  Network,
  Server,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CustomerPackage } from '../types/customerCatalog'
import { money } from '../types/customerCatalog'

export function CustomerPackageCard({
  item,
  cycle,
  selected,
  onSelect,
}: {
  item: CustomerPackage
  cycle: string
  selected: boolean
  onSelect: () => void
}) {
  const { t, i18n } = useTranslation()
  const price = item.prices[cycle]
  return (
    <article
      className={`relative flex flex-col rounded-xl border bg-white p-4 ${selected ? 'border-blue-600 shadow-[0_7px_25px_#2563eb20]' : 'border-slate-200'}`}
    >
      {item.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {t('customerBuy.popular')}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Server size={20} />
        </span>
        <div>
          <h3 className="font-bold text-[#101746]">{item.name}</h3>
          <p className="line-clamp-2 text-xs text-slate-500">
            {item.description}
          </p>
        </div>
      </div>
      <div className="mt-4 text-2xl font-bold text-blue-600">
        {price === undefined ? t('customerBuy.contact') : money(price, i18n.language)}
        <span className="ml-1 text-xs font-medium">
          /{t(`customerBuy.cycles.${cycle}`, { defaultValue: cycle })}
        </span>
      </div>
      <div className="mt-3 flex-1 space-y-2 text-sm text-[#26365e]">
        {item.features.cpu > 0 && (
          <p className="flex items-center gap-2">
            <Cpu size={15} />
            {item.features.cpu} vCPU
          </p>
        )}
        {item.features.ramGb > 0 && (
          <p className="flex items-center gap-2">
            <Database size={15} />
            {item.features.ramGb} GB RAM
          </p>
        )}
        {item.features.diskGb > 0 && (
          <p className="flex items-center gap-2">
            <HardDrive size={15} />
            {item.features.diskGb} GB {item.features.diskType}
          </p>
        )}
        {item.features.bandwidth && (
          <p className="flex items-center gap-2">
            <Globe2 size={15} />
            {item.features.bandwidth}
          </p>
        )}
        {item.features.ipCount > 0 && (
          <p className="flex items-center gap-2">
            <Network size={15} />
            {t('customerBuy.ipAddress', { count: item.features.ipCount })}
          </p>
        )}
        {item.details.map((detail) => (
          <p key={detail} className="flex items-center gap-2">
            <Check size={15} />
            {detail}
          </p>
        ))}
      </div>
      <button
        type="button"
        disabled={price === undefined}
        onClick={onSelect}
        className={`mt-5 h-10 rounded-lg border font-semibold ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-500 text-blue-600 hover:bg-blue-50'} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {selected ? t('customerBuy.selected') : t('customerBuy.selectPackage')}
      </button>
    </article>
  )
}
