import { Layers3, Server } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'
import type { ProductCategory } from '../../types/vps'

export function VpsCategoryCards({ categories, selected, onSelect }: { categories: ProductCategory[]; selected: string; onSelect: (name: string) => void }) {
  const { t } = useTranslation('catalog')
  const labels: Record<string, string> = { VPS: 'vps', Hosting: 'hosting', 'Máy chủ vật lý': 'physical', Proxy: 'proxy', VIA: 'via' }
  return <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">{categories.map((category) => { const Icon = category.icon === 'server' ? Server : Layers3; const label = t(`vps.categories.${labels[category.name]}`); return <button key={category.name} type="button" onClick={() => onSelect(category.name)} className={cn('flex items-center gap-3 rounded-xl border bg-white px-5 py-4 text-left shadow-sm transition', selected === category.name ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-blue-200')}><span className={cn('flex size-11 items-center justify-center rounded-xl', selected === category.name ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-700')}><Icon className="size-6" /></span><span><span className="block text-sm font-bold text-[#11184c]">{label}</span><span className="text-xs text-slate-500">{t('vps.packageCount', { count: category.count })}</span></span></button> })}</div>
}
