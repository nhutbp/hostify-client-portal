import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProviderCategory } from '../../services/providerCategoryService'

type Props = {
  query: string
  onQueryChange: (value: string) => void
  providerCategoryId: string
  onProviderChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  providers: ProviderCategory[]
}

const fieldClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function PhysicalFilters(props: Props) {
  const { t } = useTranslation('catalog')
  return (
    <div className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_200px_170px]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
        <input
          aria-label={t('physical.search')}
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder={t('physical.search')}
          className={`${fieldClass} pl-9`}
        />
      </label>
      <select
        aria-label={t('physical.provider')}
        value={props.providerCategoryId}
        onChange={(event) => props.onProviderChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">{t('physical.allProviders')}</option>
        {props.providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>
      <select
        aria-label={t('physical.status')}
        value={props.status}
        onChange={(event) => props.onStatusChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">{t('physical.allStatuses')}</option>
        <option value="ACTIVE">{t('physical.active')}</option>
        <option value="DRAFT">{t('physical.draft')}</option>
        <option value="ARCHIVED">{t('physical.archived')}</option>
      </select>
    </div>
  )
}
