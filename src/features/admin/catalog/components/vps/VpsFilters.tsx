import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
type Option = { id: string; code?: string; name?: string }
type Props = {
  query: string
  onQueryChange: (value: string) => void
  providerId: string
  onProviderChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  datacenterId: string
  onDatacenterChange: (value: string) => void
  providers: Option[]
  datacenters: Option[]
}

export function VpsFilters(props: Props) {
  const { t } = useTranslation('catalog')
  const select = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: { value: string; label: string }[],
  ) => (
    <label className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, 'appearance-none pr-8')}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-3 right-3 size-4 text-slate-400" />
    </label>
  )
  return (
    <div className="mb-4 grid gap-2 md:grid-cols-[minmax(180px,1fr)_145px_145px_145px]">
      <label className="relative">
        <Search className="absolute top-3 left-3 size-4 text-slate-400" />
        <input
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          className={cn(inputClass, 'pl-9')}
          placeholder={t('vps.searchPlaceholder')}
        />
      </label>
      {select(
        t('vps.filters.provider'),
        props.providerId,
        props.onProviderChange,
        props.providers.map((item) => ({
          value: item.id,
          label: item.name ?? '',
        })),
      )}
      {select(t('vps.filters.status'), props.status, props.onStatusChange, [
        { value: 'ACTIVE', label: t('vps.form.visible') },
        { value: 'DRAFT', label: t('vps.form.hidden') },
      ])}
      {select(
        t('vps.filters.datacenter'),
        props.datacenterId,
        props.onDatacenterChange,
        props.datacenters.map((item) => ({
          value: item.id,
          label: item.name ?? item.code ?? '',
        })),
      )}
    </div>
  )
}
