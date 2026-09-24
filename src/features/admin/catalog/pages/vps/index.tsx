import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { VpsCategoryCards } from '../../components/vps/VpsCategoryCards'
import { VpsFilters } from '../../components/vps/VpsFilters'
import { VpsPlansTable } from '../../components/vps/VpsPlansTable'
import { vpsCategories, vpsPlans } from '../../data/vpsPlans'
import type { VpsPlan } from '../../types/vps'

export default function AdminVpsPackagesPage() {
  const { t } = useTranslation('catalog')
  const [plans, setPlans] = useState(vpsPlans)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('VPS')
  const filteredPlans = useMemo(() => plans.filter((plan) => plan.name.toLowerCase().includes(query.toLowerCase())), [plans, query])
  const togglePlan = (name: string) => setPlans((items) => items.map((item) => item.name === name ? { ...item, enabled: !item.enabled } : item))
  const selectPlan = (plan: VpsPlan) => { void plan }
  const categoryKey = { VPS: 'vps', Hosting: 'hosting', 'Máy chủ vật lý': 'physical', Proxy: 'proxy', VIA: 'via' }[selectedCategory] ?? 'vps'
  return <div className="space-y-5 text-slate-900"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 text-xs font-medium text-slate-400">{t('vps.breadcrumb')}</p><h1 className="text-3xl font-bold tracking-tight text-[#11184c]">{t('vps.title')}</h1><p className="mt-1 text-sm text-slate-500">{t('vps.description')}</p></div><Link to="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-100 bg-white px-4 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50">{t('vps.viewWebsite')} <ExternalLink className="size-4" /></Link></div><VpsCategoryCards categories={vpsCategories} selected={selectedCategory} onSelect={setSelectedCategory} /><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-[#11184c]">{t('vps.listTitle', { category: t(`vps.categories.${categoryKey}`) })}</h2><p className="mt-1 text-sm text-slate-500">{t('vps.listDescription')}</p></div><Link to="/dashboard/catalog/vps/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Plus className="size-4" /> {t('vps.add')}</Link></div><VpsFilters query={query} onQueryChange={setQuery} /><VpsPlansTable plans={filteredPlans} onSelect={selectPlan} onToggle={togglePlan} /></section></div>
}
