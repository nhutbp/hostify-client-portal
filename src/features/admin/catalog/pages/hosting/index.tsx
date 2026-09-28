import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { HostingFilters } from '../../components/hosting/HostingFilters'
import { HostingPlansTable } from '../../components/hosting/HostingPlansTable'
import { useHostingPackages } from '../../hooks/useHostingPackages'
import { useProviderCategories } from '../../hooks/useProviderCategories'

export default function AdminHostingPackagesPage() {
  const { t } = useTranslation('catalog')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [providerCategoryId, setProviderCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const providers = useProviderCategories('')
  const list = useHostingPackages({
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
      setPage(1)
      setSearch(query)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [query])

  return (
    <div className="space-y-5 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-400">
            {t('hosting.breadcrumb')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#11184c]">
            {t('hosting.title')}
          </h1>
          <p className="mt-1 text-base text-slate-500">
            {t('hosting.description')}
          </p>
        </div>
        <Link
          to="/admin/dashboard/catalog/hosting/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="size-4" /> {t('hosting.new.create')}
        </Link>
      </header>
      <div className="min-w-0">
        <HostingFilters
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
            {t('hosting.loading')}
          </p>
        )}
        {list.isError && (
          <p role="alert" className="py-12 text-center text-red-600">
            {t('hosting.loadFailed')}: {list.error.message}
          </p>
        )}
        {list.data && (
          <HostingPlansTable data={list.data} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
