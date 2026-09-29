import { Search } from 'lucide-react'
import type { CustomerServicesFilters } from '../services/customerServicesService'
import { useTranslation } from 'react-i18next'

type Category = { slug: string; name: string; count: number }
type Provider = { id: string; name: string }

export function CustomerServicesFilters({
  filters,
  categories,
  providers,
  total,
  searchText,
  onSearchText,
  onChange,
}: {
  filters: CustomerServicesFilters
  categories: Category[]
  providers: Provider[]
  total: number
  searchText: string
  onSearchText: (value: string) => void
  onChange: (patch: Partial<CustomerServicesFilters>) => void
}) {
  const { t } = useTranslation()
  const selectClass =
    'h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-500'
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onChange({ category: undefined })}
          className={`shrink-0 rounded-lg border px-5 py-2 text-sm font-semibold ${!filters.category ? 'border-blue-600 bg-blue-600 text-white' : 'border-border bg-background text-foreground hover:border-blue-300'}`}
        >
          {t('customerServices.all')} ({total})
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => onChange({ category: category.slug })}
            className={`shrink-0 rounded-lg border px-5 py-2 text-sm font-semibold ${filters.category === category.slug ? 'border-blue-600 bg-blue-600 text-white' : 'border-border bg-background text-foreground hover:border-blue-300'}`}
          >
            {t(`customerCategories.${category.slug}`, {
              defaultValue: category.name,
            })}{' '}
            ({category.count})
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.7fr)_repeat(3,minmax(140px,1fr))_130px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label={t('customerServices.searchLabel')}
            value={searchText}
            onChange={(event) => onSearchText(event.target.value)}
            placeholder={t('customerServices.searchPlaceholder')}
            className={`${selectClass} w-full pl-9`}
          />
        </label>
        <select
          aria-label={t('customerServices.type')}
          value={filters.category ?? ''}
          onChange={(event) =>
            onChange({ category: event.target.value || undefined })
          }
          className={selectClass}
        >
          <option value="">{t('customerServices.allTypes')}</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {t(`customerCategories.${category.slug}`, {
                defaultValue: category.name,
              })}
            </option>
          ))}
        </select>
        <select
          aria-label={t('customerServices.statusLabel')}
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange({
              status: (event.target.value ||
                undefined) as CustomerServicesFilters['status'],
            })
          }
          className={selectClass}
        >
          <option value="">{t('customerServices.allStatuses')}</option>
          <option value="ACTIVE">{t('customerServices.status.ACTIVE')}</option>
          <option value="PENDING">
            {t('customerServices.status.PENDING')}
          </option>
          <option value="PROVISIONING">
            {t('customerServices.status.PROVISIONING')}
          </option>
          <option value="SUSPENDED">
            {t('customerServices.status.SUSPENDED')}
          </option>
          <option value="EXPIRED">
            {t('customerServices.status.EXPIRED')}
          </option>
          <option value="ERROR">{t('customerServices.status.ERROR')}</option>
          <option value="TERMINATED">
            {t('customerServices.status.TERMINATED')}
          </option>
        </select>
        <select
          aria-label={t('customerServices.provider')}
          value={filters.providerId ?? ''}
          onChange={(event) =>
            onChange({ providerId: event.target.value || undefined })
          }
          className={selectClass}
        >
          <option value="">{t('customerServices.allProviders')}</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <select
          aria-label={t('customerServices.sort')}
          value={filters.sort}
          onChange={(event) =>
            onChange({
              sort: event.target.value as CustomerServicesFilters['sort'],
            })
          }
          className={selectClass}
        >
          <option value="NEWEST">{t('customerServices.newest')}</option>
          <option value="OLDEST">{t('customerServices.oldest')}</option>
          <option value="EXPIRING">{t('customerServices.expiring')}</option>
        </select>
      </div>
    </div>
  )
}
