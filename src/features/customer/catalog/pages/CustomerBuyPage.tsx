import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  Cloud,
  Database,
  Globe2,
  Info,
  Layers,
  Network,
  Server,
} from 'lucide-react'
import { toast } from '@/utils/toast'
import {
  useCustomerCategories,
  useCustomerPackages,
} from '../hooks/useCustomerCatalog'
import { useAddCustomerCartItem } from '@/features/customer/commerce/hooks/useCustomerCart'
import { CustomerPackageCard } from '../components/CustomerPackageCard'
import { CustomerOrderSummary } from '../components/CustomerOrderSummary'
import type { CustomerPackage } from '../types/customerCatalog'

const icons = {
  vps: Server,
  hosting: Cloud,
  physical: Database,
  proxy: Network,
  via: Layers,
  domain: Globe2,
}
const preferredCycles = [
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUAL',
  'YEARLY',
  'ONE_TIME',
]

export default function CustomerBuyPage() {
  const { t } = useTranslation()
  const [category, setCategory] = useState('vps')
  const [cycle, setCycle] = useState('')
  const [custom, setCustom] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [locationFilter, setLocationFilter] = useState('')
  const [locationId, setLocationId] = useState('')
  const [search, setSearch] = useState('')
  const categories = useCustomerCategories()
  const activeCategory = categories.data?.some((item) => item.slug === category)
    ? category
    : (categories.data?.[0]?.slug ?? category)
  const catalog = useCustomerPackages(activeCategory)
  const addToCart = useAddCustomerCartItem()
  const items = catalog.data ?? []
  const categoryName = t(`customerCategories.${activeCategory}`, {
    defaultValue:
      categories.data?.find((item) => item.slug === activeCategory)?.name ??
      t('customerBuy.service'),
  })
  const availableCycles = [
    ...new Set(items.flatMap((item) => Object.keys(item.prices))),
  ].sort((a, b) => preferredCycles.indexOf(a) - preferredCycles.indexOf(b))
  const activeCycle = availableCycles.includes(cycle)
    ? cycle
    : (availableCycles[0] ?? '')
  const locations = [
    ...new Map(
      items
        .flatMap((item) => item.locations)
        .map((location) => [location.id, location]),
    ).values(),
  ]
  const visible = items.filter(
    (item) =>
      item.isCustom === custom &&
      item.prices[activeCycle] !== undefined &&
      (!locationFilter ||
        item.locations.some((location) => location.id === locationFilter)) &&
      (!search ||
        `${item.name} ${item.description}`
          .toLocaleLowerCase('vi')
          .includes(search.toLocaleLowerCase('vi'))),
  )
  const selected =
    visible.find((item) => item.planId === selectedPlanId) ?? visible[0]
  const selectedLocationId = selected?.locations.some(
    (location) => location.id === locationId,
  )
    ? locationId
    : (selected?.locations[0]?.id ?? '')

  async function handleAdd() {
    if (!selected || !activeCycle) return
    try {
      await addToCart.mutateAsync({
        productId: selected.id,
        planId: selected.planId,
        billingCycle: activeCycle,
        ...(selectedLocationId ? { datacenterId: selectedLocationId } : {}),
      })
      toast.success(t('customerBuy.added'))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('customerBuy.addFailed'),
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#eaf4ff] to-[#f5faff] px-5 py-8 dark:from-[#253145] dark:to-[#1c2536] md:px-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#101746] md:text-4xl">
            {t('customerBuy.hero')}
          </h1>
          <p className="mt-2 text-base text-slate-600 md:text-lg">
            {t('customerBuy.tagline')}
          </p>
        </div>
        <Server
          className="absolute right-10 top-3 hidden size-24 text-blue-300 md:block"
          strokeWidth={1.2}
        />
      </div>
      <div className="grid gap-3 rounded-xl bg-white p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
        {categories.isPending ? (
          <p className="p-4 text-slate-500">
            {t('customerBuy.loadingCategories')}
          </p>
        ) : (
          categories.data?.map((item) => {
            const Icon = icons[item.slug as keyof typeof icons] ?? Server
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.slug)
                  setCycle('')
                  setSelectedPlanId(null)
                  setLocationFilter('')
                  setLocationId('')
                  setCustom(false)
                }}
                className={`flex min-h-24 items-center gap-3 rounded-lg border p-4 text-left ${activeCategory === item.slug ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200 hover:border-blue-300'}`}
              >
                <Icon
                  className={
                    activeCategory === item.slug
                      ? 'text-blue-600'
                      : 'text-[#26365e]'
                  }
                  size={32}
                />
                <span className="min-w-0">
                  <strong className="block text-base">
                    {t(`customerCategories.${item.slug}`, {
                      defaultValue: item.name,
                    })}
                  </strong>
                  <small className="mt-1 block text-slate-500">
                    {item.description ?? ''}
                  </small>
                </span>
                <ChevronRight
                  size={15}
                  className="ml-auto shrink-0 text-blue-600"
                />
              </button>
            )
          })
        )}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold">
                {t('customerBuy.packages', { category: categoryName })}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t('customerBuy.catalogHint')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">
                {t('customerBuy.billingBy')}
              </span>
              <div className="flex rounded-lg border border-slate-200 p-1">
                {availableCycles.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setCycle(value)
                      setSelectedPlanId(null)
                    }}
                    className={`rounded-md px-3 py-1.5 ${activeCycle === value ? 'bg-blue-600 font-semibold text-white' : 'text-[#26365e]'}`}
                  >
                    {t(`customerBuy.cycles.${value}`, { defaultValue: value })}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 border-b border-slate-100 pb-4">
            <button
              type="button"
              onClick={() => {
                setCustom(false)
                setSelectedPlanId(null)
              }}
              className={`px-3 py-2 font-medium ${!custom ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
            >
              {t('customerBuy.readyMade')}
            </button>
            <button
              type="button"
              onClick={() => {
                setCustom(true)
                setSelectedPlanId(null)
              }}
              className={`px-3 py-2 font-medium ${custom ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
            >
              {t('customerBuy.custom')}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              aria-label={t('customerBuy.search')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('customerBuy.search')}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
            />
            {locations.length > 0 && (
              <select
                aria-label={t('customerBuy.filterLocation')}
                value={locationFilter}
                onChange={(event) => {
                  setLocationFilter(event.target.value)
                  setSelectedPlanId(null)
                }}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              >
                <option value="">{t('customerBuy.allLocations')}</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {catalog.isPending ? (
            <p className="py-16 text-center text-slate-500">
              {t('customerBuy.loadingPackages')}
            </p>
          ) : catalog.isError ? (
            <div className="py-12 text-center">
              <p className="text-red-600">{t('customerBuy.loadFailed')}</p>
              <button
                type="button"
                onClick={() => catalog.refetch()}
                className="mt-3 text-blue-600"
              >
                {t('customerBuy.retry')}
              </button>
            </div>
          ) : visible.length ? (
            <>
              <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {visible.map((item) => (
                  <CustomerPackageCard
                    key={item.planId}
                    item={item}
                    cycle={activeCycle}
                    selected={selected?.planId === item.planId}
                    onSelect={() => {
                      setSelectedPlanId(item.planId)
                      setLocationId('')
                    }}
                  />
                ))}
              </div>
              {activeCategory === 'vps' && (
                <div className="mt-5 overflow-x-auto">
                  <h3 className="mb-2 font-bold">{t('customerBuy.compare')}</h3>
                  <table className="w-full min-w-[600px] border-collapse text-center text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 p-2 text-left">
                          {t('customerBuy.specification')}
                        </th>
                        {visible.map((item) => (
                          <th
                            key={item.planId}
                            className="border border-slate-200 p-2"
                          >
                            {item.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compareRows(t).map(([label, value]) => (
                        <tr key={label}>
                          <th className="border border-slate-200 p-2 text-left font-normal">
                            {label}
                          </th>
                          {visible.map((item) => (
                            <td
                              key={item.planId}
                              className="border border-slate-200 p-2"
                            >
                              {value(item)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 py-16 text-center text-slate-500">
              <Info size={18} />
              {custom
                ? t('customerBuy.noCustom')
                : t('customerBuy.noPackages', { category: categoryName })}
            </div>
          )}
        </section>
        <CustomerOrderSummary
          item={selected}
          cycle={activeCycle}
          locationId={selectedLocationId}
          onLocationChange={setLocationId}
          pending={addToCart.isPending}
          onAdd={handleAdd}
        />
      </div>
    </div>
  )
}

const compareRows = (
  t: (key: string) => string,
): [string, (item: CustomerPackage) => string][] => [
  ['vCPU', (item) => String(item.features.cpu)],
  ['RAM', (item) => `${item.features.ramGb} GB`],
  [
    t('customerBuy.disk'),
    (item) => `${item.features.diskGb} GB ${item.features.diskType}`,
  ],
  [t('customerBuy.bandwidth'), (item) => item.features.bandwidth || '—'],
]
