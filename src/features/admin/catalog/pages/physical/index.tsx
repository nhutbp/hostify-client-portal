import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PhysicalFilters } from '../../components/physical/PhysicalFilters'
import { PhysicalPlansTable } from '../../components/physical/PhysicalPlansTable'
import { usePhysicalPackages } from '../../hooks/usePhysicalPackages'
import { useProviderCategories } from '../../hooks/useProviderCategories'

export default function AdminPhysicalPackagesPage() {
  const { t } = useTranslation('catalog')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [providerCategoryId, setProviderCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const providers = useProviderCategories('')
  const list = usePhysicalPackages({
    page,
    limit: 10,
    search,
    providerCategoryId: providerCategoryId || undefined,
    status:
      status === 'ACTIVE' || status === 'DRAFT' || status === 'ARCHIVED'
        ? status
        : undefined,
  })
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(query)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [query])
  return (
    <div className="space-y-5 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-400">
            {t('physical.breadcrumb')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {t('physical.title')}
          </h1>
          <p className="mt-1 text-base text-slate-500">
            {t('physical.description')}
          </p>
        </div>
        <Link
          to="/dashboard/catalog/physical/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" />
          {t('physical.new.create')}
        </Link>
      </header>
      <div className="min-w-0">
        <PhysicalFilters
          query={query}
          onQueryChange={setQuery}
          providerCategoryId={providerCategoryId}
          onProviderChange={(value) => {
            setProviderCategoryId(value)
            setPage(1)
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
          providers={providers.data ?? []}
        />
        {list.isPending && (
          <p className="py-12 text-center text-slate-500">
            {t('physical.loading')}
          </p>
        )}
        {list.isError && (
          <p role="alert" className="py-12 text-center text-red-600">
            {t('physical.loadFailed')}: {list.error.message}
          </p>
        )}
        {list.data && (
          <PhysicalPlansTable data={list.data} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
