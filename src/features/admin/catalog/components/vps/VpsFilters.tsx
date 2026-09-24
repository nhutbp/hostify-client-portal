import { ChevronDown, Filter, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function VpsFilters({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }) {
  const { t } = useTranslation('catalog')
  const filters = ['provider', 'status', 'datacenter']
  return <div className="mb-4 grid gap-2 md:grid-cols-[minmax(180px,1fr)_145px_145px_145px_auto]"><label className="relative"><Search className="absolute top-3 left-3 size-4 text-slate-400" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} className={cn(inputClass, 'pl-9')} placeholder={t('vps.searchPlaceholder')} /></label>{filters.map((key) => <label key={key} className="relative"><select className={cn(inputClass, 'appearance-none pr-8')}><option>{t(`vps.filters.${key}`)}</option><option>{t('vps.filters.all')}</option></select><ChevronDown className="pointer-events-none absolute top-3 right-3 size-4 text-slate-400" /></label>)}<button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><Filter className="size-4" /> {t('vps.filters.advanced')}</button></div>
}
