import { Layers3, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'
type ProductCategory = { id: string; name: string; slug: string; count: number }

export function VpsCategoryCards({ categories, selected, onSelect }: { categories: ProductCategory[]; selected: string; onSelect: (slug: string) => void }) {
  const { t } = useTranslation('catalog')
  return <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">{categories.map((category) => { const Icon = ['proxy', 'via'].includes(category.slug) ? Layers3 : Server; const label = t(`vps.categories.${category.slug}`, { defaultValue: category.name }); return <button key={category.id} type="button" onClick={() => onSelect(category.slug)} className={cn('flex items-center gap-3 rounded-xl border bg-white px-5 py-4 text-left shadow-sm transition', selected === category.slug ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-blue-200')}><span className={cn('flex size-11 items-center justify-center rounded-xl', selected === category.slug ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700')}><Icon className="size-6" /></span><span><span className="block text-base font-bold text-[#11184c]">{label}</span><span className="text-sm text-slate-500">{t('vps.packageCount', { count: category.count })}</span></span></button> })}</div>
}
